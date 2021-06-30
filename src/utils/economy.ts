import { MessageEmbed } from 'discord.js'
import romanizeNumber from 'romanize-number'
import db from 'quick.db'
import { getRandomInt } from './utils'
const eco = new db.table('economy')
const pets = new db.table('pets')

export const addMoney = function (user, amount) {
  let multiplier = eco.get(`${user}.multiplier`) || 1
  if (multiplier === 0) multiplier = 1
  let multiplied = amount * (multiplier * 0.01)
  let final = amount + multiplied 
  eco.add(`${user}.balance`, Math.floor(final))
  return final
}

export const addExp = function (user, skill, msg) {
  let amount = getRandomInt(2, 8)
  if (!eco.get(`${user.id}.skills`)) {
    eco.set(`${user.id}.skills`, {
      fishing: {
        exp: 0,
        level: 1,
        req: 100
      }, 
      hunting: {
        exp: 0,
        level: 1,
        req: 100
      }, 
      mining: {
        exp: 0,
        level: 1,
        req: 100
      },
      farming: {
        exp: 0,
        level: 1,
        req: 100
      }                
    })
  }
  eco.add(`${user.id}.skills.${skill}.exp`, amount)
  if (eco.get(`${user.id}.skills.${skill}.exp`) > eco.get(`${user.id}.skills.${skill}.req`)) {
    eco.subtract(`${user.id}.skills.${skill}.exp`, eco.get(`${user.id}.skills.${skill}.req`))
    eco.add(`${user.id}.skills.${skill}.req`, eco.get(`${user.id}.skills.${skill}.req`) * 0.1)
    eco.add(`${user.id}.skills.${skill}.level`, 1)
    const embed = new MessageEmbed()
      .setColor('#ff4747')
    switch (skill) {
      case 'fishing': 
        embed.addField(`:up: Level up!`, `Successfully leveled up in :fishing_pole_and_fish: **Fishing**! (Level **${romanizeNumber(eco.get(`${user.id}.skills.${skill}.level`) - 1)}** → Level **${romanizeNumber(eco.get(`${user.id}.skills.${skill}.level`))}**)`)
        break
      case 'hunting':
        embed.addField(`:up: Level up!`, `Successfully leveled up in :rabbit: **Hunting**! (Level **${romanizeNumber(eco.get(`${user.id}.skills.${skill}.level`) - 1)}** → Level **${romanizeNumber(eco.get(`${user.id}.skills.${skill}.level`))}**)`)
        break
      case 'farming':
        embed.addField(`:up: Level up!`, `Successfully leveled up in :seedling: **Farming**! (Level **${romanizeNumber(eco.get(`${user.id}.skills.${skill}.level`) - 1)}** → Level **${romanizeNumber(eco.get(`${user.id}.skills.${skill}.level`))}**)`)
        break 
      case 'mining':
        embed.addField(`:up: Level up!`, `Successfully leveled up in :pick: **Mining**! (Level **${romanizeNumber(eco.get(`${user.id}.skills.${skill}.level`) - 1)}** → Level **${romanizeNumber(eco.get(`${user.id}.skills.${skill}.level`))}**)`)
        break
    }
    msg.reply({ embeds: [embed] })
  }
  return amount
}


export const runPetChecks = async function (bot) {
  setInterval(() => {
    pets.all().forEach(user => {
      let list = pets.get(`${user.ID}.pets`) || []
      const a = list.filter(value => value.id === pets.get(`${user.ID}.active`))[0] || undefined
      if (a) {
        const i = list.indexOf(a)
        const chance = getRandomInt(1, 7)
        const hunger = a.hunger || 100
        const happiness = a.happiness || 100
        if (chance === 5) {
          if (a.happiness !== 0) a.happiness--
        } else if (chance === 6) {
          if (a.hunger !== 0) a.hunger--
        }
        const health = (hunger + happiness / 200) * 100
        let income = a.income
        if (health < 50) income = a.income / 2
        list[i] = a
        pets.add(`${user.ID}.income`, income)
        if (pets.get(`${user.ID}.energy`) !== 10) pets.add(`${user.ID}.energy`, 1)
        pets.set(`${user.ID}.pets`, list)
      }
    })
    console.log('Updated pets, next one in 30 minutes.')
  }, 1800000)
}

export const runUnvoteChecks = function (bot) {
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
            if (unvote.site === 'discordbotlistcom') eco.set(`${unvote.user}.votedDBL`, false)
            else if (unvote.site === 'topgg') eco.set(`${unvote.user}.votedTop`, false)
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