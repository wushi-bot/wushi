import chalk from 'chalk'
import express from 'express'
import bodyParser from 'body-parser'
import { MessageEmbed } from 'discord.js'
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
      eco.add(`${req.body.user}.balance`, 15750)
      eco.add(`${req.body.user}.multiplier`, 8)
      bonus = true
    } else {
      eco.add(`${req.body.user}.balance`, 15000)
      eco.add(`${req.body.user}.multiplier`, 5)
      bonus = false
    }
    eco.set(`${req.body.user}.voted`, true)
    eco.push('unvotes', { user: req.body.user, unvoteAt: new Date().getTime() + 43200000, bonus: bonus })
    try {
      if (bonus) embed.addField('<:check:820704989282172960> Thanks for voting!', 'You receive the following perks while you have the voting perk: \n\n+ :coin: **15,750*\n+ :crown: **8% Multiplier**')
      else embed.addField('<:check:820704989282172960> Thanks for voting!', 'You receive the following perks while you have the voting perk: \n\n+ :coin: **15,000*\n+ :crown: **5% Multiplier**')
      embed.setFooter('These perks will expire when your vote renews again.')
      embed.setColor('#ff4747')
      user.send(embed)
    } catch {}  
  })
  
  app.listen(process.env.PORT, () => {})
}

module.exports.run = (bot) => {
  bot.logger.log('info', `Ready! Logged in as ${bot.user.username}#${bot.user.discriminator}`)
  console.log(chalk.black('────────────────────────────────────────────────────────────'))
  bot.user.setActivity('.help | .support', { type: 'LISTENING' })
  webServer(bot)
}