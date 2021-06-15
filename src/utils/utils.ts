import db from 'quick.db'
const cfg = new db.table('config')
const leveling = new db.table('leveling')

module.exports.getPrefix = function (id: string) {
  if (!cfg.get(`${id}.prefix`)) {
    return '.'
  } else {
    return cfg.get(`${id}.prefix`)
  }
}

