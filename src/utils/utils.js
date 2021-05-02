import db from 'quick.db'
import DBL from 'dblapi.js'

const dbl = new DBL(process.env.DBL_TOKEN, { webhookPort: 6000, webhookAuth: '123' })
const cfg = new db.table('config')
const leveling = new db.table('leveling')

import keys from '../resources/key.json'
import tools from '../resources/items/tools.json'
import upgrades from '../resources/items/upgrades.json'

module.exports.updateStats = function (guildCount) {
  return dbl.postStats(guildCount)
}

module.exports.getPrefix = function (id) {
  if (!cfg.get(`${id}.prefix`)) {
    return '.'
  } else {
    return cfg.get(`${id}.prefix`)
  }
}

module.exports.getCategories = function () {
  const categories = []
  for (const category in keys) {
    if (category) categories.push(category)
  }
  return categories
}

module.exports.checkLevel = function (id, serverId) {
  if (!leveling.get(`${serverId}.${id}.expNeeded`)) {
    leveling.set(`${serverId}.${id}.expNeeded`, 100)
  }
  if (!leveling.get(`${serverId}.${id}.level`)) {
    leveling.set(`${serverId}.${id}.level`, 0)
  }
  if (!leveling.get(`${serverId}.${id}.exp`)) {
    leveling.set(`${serverId}.${id}.exp`, 0)
  }
  if (!leveling.get(`${serverId}.${id}.totalExp`)) {
    leveling.set(`${serverId}.${id}.totalExp`, 0)
  }
}

module.exports.toTitleCase = function (str) {
  return str.replace(
    /\w\S*/g,
    function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    }
  )
}

module.exports.removeA = function (arr) {
  const a = arguments
  let L = a.length
  let ax
  const what = a[--L]
  if ((ax = arr.indexOf(what)) !== -1) {
    arr.splice(ax, 1)
  }
  return arr
}

module.exports.abbreviationToNumber = function (val) {
  if (isNaN(val)) {
    let multiplier = val.substr(-1).toLowerCase()
    if (multiplier == 'k')
      return parseFloat(val) * 1000
    else if (multiplier === 'm')
      return parseFloat(val) * 1000000
    else if (multiplier === 'b')
      return parseFloat(val) * 1000000000
  } else {
    return val
  }
}

module.exports.getRandomInt = function (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}

module.exports.getItem = function (arr, value) {
  let returnedItem
  arr.forEach(item => {
    if (item.id === value) {
      returnedItem = item
    }
  })
  if (!returnedItem) return undefined
  return returnedItem
}

module.exports.allItems = function () {

  const allItems = []
  for (const item in tools) {
    allItems.push(tools[item])
  }
  for (const item in upgrades) {
    allItems.push(upgrades[item])
  }   
  return allItems
}

module.exports.addCommas = function (nStr) {
  nStr += ''
  var x = nStr.split('.')
  var x1 = x[0]
  var x2 = x.length > 1 ? '.' + x[1] : ''
  var rgx = /(\d+)(\d{3})/
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2')
  }
  return x1 + x2
}