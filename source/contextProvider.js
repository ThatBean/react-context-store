import { PureComponent, Children } from 'react'
import PropTypes from 'prop-types'
import { contextStoreShapeTypes } from './contextStore'
import { requestAnimationFrame, cancelAnimationFrame } from './utils'

/**
 * provide store as context
 */
const createContextProvider = (storeName) => class ContextProvider extends PureComponent {
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

    this.batchPerform = () => { // batch in React
      this.batchedFrameId = null
      this.setState({ isBatched: true })
    }

    this.batchedFrameId = null
    this.batchedUpdateList = []
    this.childContext = {
      [storeName]: this.props.store,
      [`${storeName}BatchUpdate`]: (callback) => {
        this.batchedUpdateList.push(callback)
        if (!this.batchedFrameId && this.batchPerform) this.batchedFrameId = requestAnimationFrame(this.batchPerform)
      }
    }

    this.state = { isBatched: false }
  }

  getChildContext () { return this.childContext }

  shouldComponentUpdate (nextProps, nextState) {
    if (nextState.isBatched && this.batchedUpdateList.length) {
      this.batchedUpdateList.forEach((v) => v())
      this.batchedUpdateList.length = 0
      this.setState({ isBatched: false }) // clean up
    }
    return (this.props !== nextProps)
  }

  componentWillUnmount () {
    this.batchedFrameId && cancelAnimationFrame(this.batchedFrameId)
    this.batchedFrameId = null
    this.batchPerform = null
  }

  render () {
    return Children.only(this.props.children)
  }
}

export {
  createContextProvider
}
