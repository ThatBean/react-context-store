const requestAnimationFrame = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  ((callback) => window.setTimeout(callback, Math.ceil(16 - Date.now() % 16))) // expected to batch callback at about every 16 msec

const cancelAnimationFrame = window.cancelAnimationFrame ||
  window.webkitCancelAnimationFrame ||
  window.mozCancelAnimationFrame ||
  ((requestID) => window.clearTimeout(requestID)) // expected to batch callback at about every 16 msec

const getRandomId = (prefix = '') => `${prefix}${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`

const checkIsStatelessComponent = (component) => typeof (component) === 'string' || !component.prototype || !component.prototype.render

const toArray = (value) => (value instanceof Array ? value : value ? [ value ] : [])

const composeSelectorList = (selectorList) => selectorList.reduce((preList, selector) => {
  const fragList = toArray(selector)
  if (!fragList.length) return preList
  const concatList = []
  preList.forEach((pre) => fragList.forEach((frag) => concatList.push(`${pre}|${frag}`)))
  return concatList
}, [ '@@' ])

const composeKey = (keyFragList) => `@@|${keyFragList.join('|')}`

class KeySwitch {
  constructor () { this.keyMap = {} } // {String} - {value}

  get (key) { return this.keyMap[ key ] || null }

  set (keyList, value) { keyList.forEach((key) => (this.keyMap[ key ] = value)) }

  check (keyList, value) { return keyList.length && keyList.every((key) => this.keyMap[ key ] === value) }

  GET (...fragList) { return this.get(composeKey(fragList)) }

  SET (selectorList, value) { this.set(composeSelectorList(selectorList), value) }
}

export {
  requestAnimationFrame,
  cancelAnimationFrame,
  getRandomId,
  checkIsStatelessComponent,
  composeSelectorList,
  composeKey,
  KeySwitch
}
