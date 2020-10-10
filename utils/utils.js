const db = require('quick.db')
const economy = new db.table('economy')
const cfg = new db.table('config')

module.exports.addMoney = function (a, id) {
  if (economy.get(`${id}.effects`).includes('doubling')) {
    economy.add(`${id}.balance`, a * 2)
    return a * 2
  } else {
    economy.add(`${id}.balance`, a)
    return a
  }
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

module.exports.getPrefix = function (id) {
  if (!cfg.get(`${id}.prefix`)) {
    return '.'
  } else {
    return cfg.get(`${id}.prefix`)
  }
}
