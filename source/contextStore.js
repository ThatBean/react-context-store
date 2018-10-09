import PropTypes from 'prop-types'

const contextStoreShapeTypes = PropTypes.shape({
  getState: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired, // only way to change state
  subscribe: PropTypes.func.isRequired,
  subscribeStateChange: PropTypes.func.isRequired
})

// onDispatch: called every time a dispatched action is received, can change state if needed
const createContextStore = ({ initialState, reducer }, onDispatch) => {
  let state = initialState // update in an immutable way
  const listenerState = {} // List in a Map: type - listenerList - listener
  const listenerStateChange = new Set() // List in a Set: listener

  const getState = () => state

  const dispatch = (action) => {
    const prevState = state
    state = reducer(state, action) // state may change here
    if (onDispatch) state = onDispatch(state, prevState, action, emit) || state // state may change here, too
    if (state !== prevState) emitStateChange(state, prevState)
  }

  const emit = (emitType, emitState) => {
    const listenerList = listenerState[ emitType ]
    __DEV__ && !listenerList && console.log('missed emit', emitType, emitState)
    listenerList && listenerList.forEach((listener) => listener(emitType, emitState))
  }

  const subscribe = (type, listener) => {
    listenerState[ type ] = listenerState[ type ] ? [ ...listenerState[ type ], listener ] : [ listener ]
    return () => { listenerState[ type ] = listenerState[ type ].filter((v) => v !== listener) } // unsubscribe function
  }

  const subscribeStateChange = (listener) => {
    listenerStateChange.add(listener)
    return () => { listenerStateChange.delete(listener) } // unsubscribe function
  }

  const emitStateChange = (state, prevState) => listenerStateChange.forEach((listener) => listener(state, prevState))

  return {
    getState,
    dispatch,
    subscribe,
    subscribeStateChange
  }
}

export { createContextStore, contextStoreShapeTypes }
