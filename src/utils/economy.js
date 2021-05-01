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

module.exports.runUnvoteChecks = function (bot) {
  setInterval(() => {
    const date = new Date().getTime()
    const unvotes = eco.get('unvotes') || []
    if (unvotes.length > 0) {
      for (let unvote of unvotes) {
        if (unvote.unvoteAt !== false) {
          if (unvote.unvoteAt <= date) {
            let removing = unvotes.filter(function (x) { return x === unvote })[0]
            let i = unvotes.indexOf(removing)
            unvotes.splice(i, 1)
            eco.set('unvotes', unvotes)
            eco.set(`${unvote.user}.voted`, false)
            if (unvote.bonus) {
              eco.subtract(`${unvote.user}.multiplier`, 8)
            } else {
              eco.subtract(`${unvote.user}.multiplier`, 5)
            }
          }
        }
      }
    }
  }, (8000)) 
}
