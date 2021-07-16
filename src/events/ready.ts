import chalk from 'chalk'
import express from 'express'
import bodyParser from 'body-parser'
import { MessageEmbed } from 'discord.js'
import { updateStats, addCommas } from '../utils/utils'
import db from 'quick.db'

const eco = new db.table('economy')
const pets = new db.table('pets')

async function webServer(bot) {
  const app = express()
  app.use(bodyParser.json())
  app.use(express.json()) 
  app.use(express.urlencoded({ extended: true }))

  app.get('/eco/:id', async (req, res) => {
    if (!req.get('Authorization')) return res.status(400).end()
    if (req.get('Authorization') !== process.env.AUTHORIZATION) return res.status(401).end()
    const user = await bot.users.fetch(req.params.id)
    if (!user) return res.status(404).end()
    const ecoUser = eco.get(`${user.id}`)
    return res.status(200).send({
      balance: ecoUser.balance,
      bank: ecoUser.bank,
      votedTop: ecoUser.votedTop,
      votedDBL: ecoUser.votedDBL,
      prestige: ecoUser.prestige,
      multiplier: ecoUser.multiplier,
      weekly: ecoUser.weekly,
      daily: ecoUser.daily,
      items: ecoUser.items
    })
  })

  app.get('/commands', async (req, res) => {
    if (!req.get('Authorization')) return res.status(400).end()
    if (req.get('Authorization') !== process.env.AUTHORIZATION) return res.status(401).end()
    const commands = []
    bot.commands.array().forEach(command => commands.push({ 
      name: command.conf.name, 
      description: command.conf.description, 
      category: command.conf.category,
      usage: command.conf.usage,
      aliases: command.conf.aliases,
      cooldown: command.conf.cooldown
     }))
    return res.status(200).send({ commands })
  })

  app.post('/dblHook', (req, res) => {
    if (!req.get('Authorization')) return res.status(400).end()
    if (req.get('Authorization') !== process.env.DBL_AUTHORIZATION) return res.status(401).end()
    res.status(200).end()
    const user = bot.users.cache.get(req.body.user)
    const embed = new MessageEmbed()
    let bonus
    if (req.body.isWeekend) {
      eco.add(`${user.id}.balance`, 1000 + (1000 * (eco.get(`${user.id}.multiplier`) * 0.1)) * eco.get(`${user.id}.prestige`))
      eco.add(`${user.id}.multiplier`, 2)
      bonus = true
    } else {
      eco.add(`${user.id}.balance`, 750 + (750 * (eco.get(`${user.id}.multiplier`) * 0.1)) * eco.get(`${user.id}.prestige`))
      eco.add(`${user.id}.multiplier`, 1)
      bonus = false
    }
    eco.set(`${user.id}.votedTop`, true)
    eco.push('unvotes', { user: req.body.user, unvoteAt: new Date().getTime() + 43200000, bonus: bonus, site: 'topgg' })
    try {
      if (bonus) embed.addField('<:check:820704989282172960> Thanks for voting!', `You receive the following perks while you have the voting perk: \n+ :coin: **${addCommas(Math.floor(1000 + (1000 * (eco.get(`${user.id}.multiplier`) * 0.1)) * eco.get(`${user.id}.prestige`)))}**\n+ :crown: **2% Multiplier**`)
      else embed.addField('<:check:820704989282172960> Thanks for voting!', `You receive the following perks while you have the voting perk: \n+ :coin: **${addCommas(Math.floor(750 + (750 * (eco.get(`${user.id}.multiplier`) * 0.1)) * eco.get(`${user.id}.prestige`)))}**\n+ :crown: **1% Multiplier**`)
      embed.addField(':question: Expiry', `These perks will expire at <t:${new Date().getTime() + 43200000}:R>`)
      embed.setFooter('These perks will expire when your vote renews again.')
      embed.setColor('#ff4747')
      user.send(embed)
    } catch {}  
  })
 
  app.post('/dbl2Hook', (req, res) => {
    if (!req.get('Authorization')) return res.status(400).end()
    if (req.get('Authorization') !== process.env.DBL_AUTHORIZATION) return res.status(401).end()
    res.status(200).end()
    const user = bot.users.cache.get(req.body.id)
    const embed = new MessageEmbed()
    eco.add(`${user.id}.balance`, 750 + (750 * (eco.get(`${user.id}.multiplier`) * 0.1)) * eco.get(`${user.id}.prestige`))
    eco.add(`${user.id}.multiplier`, 1)
    eco.set(`${user.id}.votedDBL`, true)
    eco.push('unvotes', { user: req.body.id, unvoteAt: new Date().getTime() + 43200000, site: 'discordbotlistcom' })
    try {
      embed.addField('<:check:820704989282172960> Thanks for voting!', `You receive the following perks while you have the voting perk: \n+ :coin: **${addCommas(Math.floor(750 + (750 * (eco.get(`${user.id}.multiplier`) * 0.1)) * eco.get(`${user.id}.prestige`)))}**\n+ :crown: **1% Multiplier**`)
      embed.setFooter('These perks will expire when your vote renews again.')
      embed.addField(':question: Expiry', `These perks will expire at <t:${new Date().getTime() + 43200000}:R>`)
      embed.setColor('#ff4747')
      user.send(embed)
    } catch {}  
  })

  app.listen(process.env.PORT, () => {})
}

const statuses = [
  {
    type: 'LISTENING',
    name: '.help | .support'
  },
  {
    type: 'PLAYING',
    name: 'vote for the bot using .vote'
  },
  {
    type: 'LISTENING',
    name: '.vote'
  },
  {
    type: 'PLAYING',
    name: '.help | .vote'
  },
  {
    type: 'LISTENING',
    name: '.support | Did you join the support server?'
  },
  {
    type: 'PLAYING',
    name: '.donate | Donate to support the bot!'
  },
  {
    type: 'WATCHING',
    name: '{servers} servers | {users} users'
  }
]

function changeStatus (bot) {
  const status = statuses[~~(Math.random() * statuses.length)]
  let type = status.type
  let name = status.name.replace('{servers}', bot.guilds.cache.array().length)
  name = name.replace('{users}', bot.users.cache.array().length)
  bot.user.setActivity(name, {
    type: type
  })
}

module.exports.run = async (bot) => {
  bot.logger.log('info', `Ready! Logged in as ${bot.user.username}#${bot.user.discriminator}`)
  console.log(chalk.black('────────────────────────────────────────────────────────────'))
  await webServer(bot)
  setInterval(() => changeStatus(bot), 60000)
  setInterval(async () => {
    if (bot.user.id === '755526238466080830') {
      await updateStats(bot.guilds.cache.size)
      bot.logger.log('runner', 'Updated guild stats on top.gg (next one in 1 hour)')
    }
  }, 3600000)
}