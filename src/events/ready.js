import chalk from 'chalk'
import express from 'express'
import bodyParser from 'body-parser'
import { MessageEmbed } from 'discord.js'
import { updateStats } from '../utils/utils'
import db from 'quick.db'

const eco = new db.table('economy')

function webServer(bot) {
  const app = express()
  app.use(bodyParser.json())
  app.use(express.json()) 
  app.use(express.urlencoded({ extended: true }))

  app.post('/dblHook', (req, res) => {
    if (!req.get('Authorization')) return res.status(400).end()
    if (req.get('Authorization') !== process.env.DBL_AUTHORIZATION) return res.status(401).end()
    res.status(200).end()
    const user = bot.users.cache.get(req.body.user)
    const embed = new MessageEmbed()
    let bonus
    if (req.body.isWeekend) {
      eco.add(`${user.user.id}.balance`, 5250)
      eco.add(`${user.user.id}.multiplier`, 2)
      bonus = true
    } else {
      eco.add(`${user.user.id}.balance`, 5000)
      eco.add(`${user.user.id}.multiplier`, 1)
      bonus = false
    }
    eco.set(`${req.body.user}.voted`, true)
    eco.push('unvotes', { user: req.body.user, unvoteAt: new Date().getTime() + 43200000, bonus: bonus })
    try {
      if (bonus) embed.addField('<:check:820704989282172960> Thanks for voting!', 'You receive the following perks while you have the voting perk: \n\n+ :coin: **15,750**\n+ :crown: **8% Multiplier**')
      else embed.addField('<:check:820704989282172960> Thanks for voting!', 'You receive the following perks while you have the voting perk: \n\n+ :coin: **15,000**\n+ :crown: **5% Multiplier**')
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
    eco.add(`${user.user.id}.balance`, 5000)
    eco.add(`${user.user.id}.multiplier`, 1)
    eco.set(`${req.body.id}.voted`, true)
    eco.push('unvotes', { user: req.body.id, unvoteAt: new Date().getTime() + 43200000 })
    try {
      embed.addField('<:check:820704989282172960> Thanks for voting!', 'You receive the following perks while you have the voting perk: \n\n+ :coin: **15,000**\n+ :crown: **5% Multiplier**')
      embed.setFooter('These perks will expire when your vote renews again.')
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
  }
]

function changeStatus (bot) {
  const status = statuses[~~(Math.random() * statuses.length)]
  let type = status.type
  bot.user.setActivity(status.name, {
    type: type
  })
}

module.exports.run = (bot) => {
  bot.logger.log('info', `Ready! Logged in as ${bot.user.username}#${bot.user.discriminator}`)
  console.log(chalk.black('────────────────────────────────────────────────────────────'))
  webServer(bot)
  setInterval(() => changeStatus(bot), 60000)
  setInterval(async () => {
    if (bot.user.id === '755526238466080830') {
      await updateStats(bot.guilds.cache.size)
      bot.logger.log('runner', 'Updated guild stats on top.gg')
    }
  }, 3600000)
}