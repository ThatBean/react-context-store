import { PureComponent, Children } from 'react'
import PropTypes from 'prop-types'
import { contextStoreShapeTypes } from './contextStore'
import { requestAnimationFrame } from './utils'

/**
 * provide store as context
 */
const createContextProvider = (storeName) => {
  return class ContextProvider extends PureComponent {
    static propTypes = {
      store: contextStoreShapeTypes.isRequired,
      children: PropTypes.element.isRequired
    }

    static childContextTypes = {
      [storeName]: contextStoreShapeTypes.isRequired,
      [`${storeName}BatchUpdate`]: PropTypes.func.isRequired
    }

    constructor (props, context) {
      super(props, context)

      let isBatched = false
      const batchPerform = () => { // batch in React
        this.setState({ isBatched: true })
        isBatched = false
      }

      this.batchedUpdateList = []
      this.childContext = {
        [storeName]: this.props.store,
        [`${storeName}BatchUpdate`]: (callback) => {
          this.batchedUpdateList.push(callback)
          isBatched || requestAnimationFrame(batchPerform)
          isBatched = true
        }
      }

      this.state = {
        isBatched: false
      }
    }

    shouldComponentUpdate (nextProps, nextState) {
      if (nextState.isBatched && this.batchedUpdateList.length) {
        // __DEV__ && console.log('runBatched', this.batchedUpdateList.length)
        this.batchedUpdateList.forEach((v) => v())
        this.batchedUpdateList.length = 0
        this.setState({ isBatched: false }) // clean up
      }
      return (this.props !== nextProps)
    }

    getChildContext () {
      return this.childContext
    }

    render () {
      return Children.only(this.props.children)
    }
  }
}

export {
  createContextProvider
}
