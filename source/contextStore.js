import { PropTypes } from 'react'

const contextStoreShapeTypes = PropTypes.shape({
  getState: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired, // only way to change state
  subscribe: PropTypes.func.isRequired,
  subscribeStateChange: PropTypes.func.isRequired
})

/**
 * @param StateScheme     Object contains { initialState, reducer }
 * @param onDispatch      called every time a dispatched action is received, can change state if needed
 */
const createContextStore = (StateScheme, onDispatch) => {
  let state = StateScheme.initialState // update in an immutable way
  let listenerState = {} // List in a Map: type - listenerList - listener
  let listenerStateChange = new Set() // List in a Set: listener

  const getState = () => state

  const dispatch = (action) => {
    const prevState = state
    state = StateScheme.reducer(state, action) // state may change here
    if (onDispatch) state = onDispatch(state, prevState, action, emit) || state // state may change here, too
    if (state !== prevState) emitStateChange(state, prevState)
  }

  const emit = (emitType, emitState) => {
    const listenerList = listenerState[ emitType ]
    // __DEV__ && !listenerList && console.log('missed emit', emitType, emitState)
    // __DEV__ && listenerList && console.log('emit', emitType, Date.now())
    listenerList && listenerList.forEach((listener) => listener(emitType, emitState))
  }

  const subscribe = (type, listener) => {
    listenerState[ type ] = listenerState[ type ] ? [ ...listenerState[ type ], listener ] : [ listener ]
    return () => { listenerState[ type ] = listenerState[ type ].filter((v) => v !== listener) }
  }

  const subscribeStateChange = (listener) => {
    listenerStateChange.add(listener)
    return () => { listenerStateChange.delete(listener) }
  }

  const emitStateChange = (state, prevState) => {
    listenerStateChange.forEach((listener) => listener(state, prevState))
  }

  return {
    getState,
    dispatch,
    subscribe,
    subscribeStateChange
  }
}

export {
  createContextStore,
  contextStoreShapeTypes
}
