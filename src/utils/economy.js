import db from 'quick.db'
import utils from './utils'
const eco = new db.table('economy')
const pets = new db.table('pets')

module.exports.addMoney = function (user, amount) {
  let multiplier = eco.get(`${user}.multiplier`) || 1
  if (multiplier === 0) multiplier = 1
  let multiplied = amount * (multiplier * 0.01)
  let final = amount + multiplied 
  eco.add(`${user}.balance`, Math.floor(final))
  return final
}

module.exports.runPetChecks = async function (bot) {
  setInterval(() => {
    pets.all().forEach(user => {
      let list = pets.get(`${user.ID}.pets`) || []
      const a = list.filter(value => value.id === pets.get(`${user.ID}.active`))[0]
      const i = list.indexOf(a)
      const chance = utils.getRandomInt(1, 10)
      if (chance === 5) {
        if (a.happiness !== 0) a.happiness--
      } else if (chance === 6) {
        if (a.hunger !== 0) a.hunger--
      }
      const health = (a.hunger + a.happiness / 200) * 100
      let income = a.income
      if (health < 50) income = a.income / 2
      list[i] = a
      pets.add(`${user.ID}.income`, income)
      if (pets.get(`${user.ID}.energy`) !== 10) pets.add(`${user.ID}.energy`, 1)
      pets.set(`${user.ID}.pets`, list)
      bot.logger.log('runner', 'Updated pets, next one in 30 minutes.')
    })
  }, 1800000)
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
              eco.subtract(`${unvote.user}.multiplier`, 2)
            } else {
              eco.subtract(`${unvote.user}.multiplier`, 1)
            }
          }
        }
      }
    }
  }, (8000)) 
}
