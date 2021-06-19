import db from 'quick.db'
import DBL from 'dblapi.js'

const dbl = new DBL(process.env.DBL_TOKEN!!, { webhookPort: 6000, webhookAuth: '123' })
const cfg = new db.table('config')
const leveling = new db.table('leveling')

import keys from '../resources/key.json'
import tools from '../resources/items/tools.json'
import upgrades from '../resources/items/upgrades.json'
import petstuff from '../resources/items/petstuff.json'

export const updateStats = function (guildCount) {
  return dbl.postStats(guildCount)
}

export const getPrefix = function (id) {
  if (!cfg.get(`${id}.prefix`)) {
    return '.'
  } else {
    return cfg.get(`${id}.prefix`)
  }
}

export const getRandomInt = function (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}

export const addCommas = function (nStr) {
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