import { MessageEmbed } from 'discord.js'
import romanizeNumber from 'romanize-number'
import db from 'quick.db'
import { getColor, getRandomInt } from './utils'
import User from '../models/User'

const pets = new db.table('pets')

export const addMoney = async function (user, amount) {
  const result = await User.findOne({
    id: user
  }).exec()
  let multiplier = result.multiplier || 1
  if (multiplier === 0) multiplier = 1
  let multiplied = amount * (multiplier * 0.01)
  let final: Number = amount + multiplied 
  if (!result.balance) result.balance = 0
  result.balance += final 
  result.save()
  return final
}

export const addExp = async function (user, skill, msg, bot = null) {
  let amount = getRandomInt(2, 8)
  const users = await User.find({
    id: user.id
  }).exec()
  if (!users[0].skills) {
    users[0].skills = {
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
  users[0].skills[skill].exp += amount
  if (users[0].skills[skill].exp > users[0].skills[skill].req) {
    users[0].skills[skill].exp -= users[0].skills[skill].req
    users[0].skills[skill].req += users[0].skills[skill].req * 0.1
    users[0].skills[skill].level += 1
    const color = await getColor(bot, user) || '#ff4747'
    const embed = new MessageEmbed()
      .setColor(color)
    switch (skill) {
      case 'fishing': 
        embed.addField(`:up: Level up!`, `Successfully leveled up in :fishing_pole_and_fish: **Fishing**! (Level **${romanizeNumber(users[0].skills[skill].level - 1)}** → Level **${romanizeNumber(users[0].skills[skill].level)}**)`)
        break
      case 'hunting':
        embed.addField(`:up: Level up!`, `Successfully leveled up in :rabbit: **Hunting**! (Level **${romanizeNumber(users[0].skills[skill].level - 1)}** → Level **${romanizeNumber(users[0].skills[skill].level)}**)`)
        break
      case 'farming':
        embed.addField(`:up: Level up!`, `Successfully leveled up in :seedling: **Farming**! (Level **${romanizeNumber(users[0].skills[skill].level - 1)}** → Level **${romanizeNumber(users[0].skills[skill].level)}**)`)
        break 
      case 'mining':
        embed.addField(`:up: Level up!`, `Successfully leveled up in :pick: **Mining**! (Level **${romanizeNumber(users[0].skills[skill].level - 1)}** → Level **${romanizeNumber(users[0].skills[skill].level)}**)`)
        break
    }
    msg.reply({ embeds: [embed] })
  }
  users[0].save()
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
    bot.logger.log('info', 'Updated pets. (Next one in 30 minutes.)')
  }, 3600000)
}

export const runUnvoteChecks = async function (bot) {
  setInterval(async () => {
    const date = new Date().getTime()
    const unvotes = await User.find({
      votes
    }).exec() || []
    console.log(unvotes)
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