import { Component, PropTypes, createElement } from 'react'
import { contextStoreShapeTypes } from './contextStore'
import { getRandomId } from './utils'

/**
 * create a wrapper component to interact with ContextProvider and pass state down as props
 */
function createContextConnector (storeName, wrappedComponent, { emitCallbackMap = {}, onConstruct, onMount, onUnmount }) {
  return class ContextConnector extends Component {
    static propTypes = {
      id: PropTypes.string
    }

    static contextTypes = {
      [storeName]: contextStoreShapeTypes.isRequired,
      [`${storeName}BatchUpdate`]: PropTypes.func.isRequired
    }

    constructor (props, context) {
      super(props, context)

      this.onEmit = this.onEmit.bind(this)
      this.getWrappedRef = () => this.wrappedRef
      this.setWrappedRef = (ref) => (this.wrappedRef = ref)

      this.store = this.context[ storeName ]
      this.batchUpdate = this.context[ `${storeName}BatchUpdate` ]
      this.batchedState = null
      this.setBatchedState = () => {
        this.batchedState && this.setState(this.batchedState)
        this.batchedState = null
      }
      this.getCurrentState = () => (this.batchedState || this.state)
      this.wrappedRef = null
      this.state = { // NOTE: may add user defined state in onEmit - batchUpdate
        id: props.id || getRandomId()
      }

      onConstruct && onConstruct(this)
    }

    onEmit (emitType, emitState) {
      const emitCallback = emitCallbackMap[ emitType ]
      if (!emitCallback) return
      const currentState = this.getCurrentState()
      const state = emitCallback(currentState, emitState, this) // like a Redux reducer
      if (!state || state === currentState) return
      // this.batchedState || console.log(emitType) // batch once
      this.batchedState || this.batchUpdate(this.setBatchedState) // batch once
      this.batchedState = state
    }

    componentDidMount () {
      this.unsubscribeList = Object.keys(emitCallbackMap).map((type) => this.store.subscribe(type, this.onEmit))
      onMount && onMount(this)
    }

    componentWillUnmount () {
      onUnmount && onUnmount(this)
      this.unsubscribeList.forEach((unsubscribe) => unsubscribe())
    }

    render () {
      return createElement(
        wrappedComponent,
        {
          ...this.props,
          ...this.state,
          ref: this.setWrappedRef
        }
      )
    }
  }
}

export {
  createContextConnector
}
