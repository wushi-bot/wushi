import db from 'quick.db'
const eco = new db.table('economy')

module.exports.addMoney = function (user, amount) {
  let multiplier = eco.get(`${user}.multiplier`) || 1
  if (multiplier === 0) multiplier = 1
  let multiplied = amount * (multiplier * 0.01)
  let final = amount + multiplied 
  eco.add(`${user}.balance`, Math.floor(final))
  return final
}