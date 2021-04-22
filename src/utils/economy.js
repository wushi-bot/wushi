import db from 'quick.db'
const eco = new db.table('economy')

module.exports.addMoney = function (user, amount) {
  let multiplier = eco.get(`${user}.multiplier`) || 1
  if (multiplier === 0) multiplier = 1
  let multiplied = amount * (multiplier * 0.01)
  console.log(multiplied)
  console.log(amount)
  let final = amount + multiplied 
  console.log(final)
  eco.add(`${user}.balance`, final)
  return final
}