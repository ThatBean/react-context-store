// relative time in msec
const now = window.performance ? window.performance.now.bind(window.performance)
  : window.Date.now ? window.Date.now.bind(window.Date)
    : () => (new Date().getTime())

const requestAnimationFrame = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  ((callback) => window.setTimeout(callback, Math.ceil(16 - now() % 16))) // expected to batch callback at about every 16 msec

function getRandomInt (from, to) { return Math.floor(Math.random() * (to - from + 1) + from) }
function getRandomId (prefix = '') { return `${prefix}${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 10)}` }

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

  set (keyList, value) { keyList.forEach((key) => (this.keyMap[ key ] = value)) }

  SET (selectorList, value) { this.set(composeSelectorList(selectorList), value) }

  get (key) { return this.keyMap[ key ] || null }

  GET (...fragList) { return this.get(composeKey(fragList)) }

  check (keyList, value) { return keyList.length && keyList.every((key) => this.keyMap[ key ] === value) }
}

export {
  now,
  requestAnimationFrame,
  getRandomInt,
  getRandomId,
  composeSelectorList,
  composeKey,
  KeySwitch
}
