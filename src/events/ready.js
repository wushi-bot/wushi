import chalk from 'chalk'
import express from 'express'
import bodyParser from 'body-parser'
import { MessageEmbed } from 'discord.js'
import db from 'quick.db'

const eco = new db.table('economy')

function webServer(bot) {
  const app = express()
  app.use(bodyParser.json())
  
  app.post('/dblHook', (req, res) => {
    if (!req.get('Authorization')) return res.status(400).end()
    if (req.get('Authorization') !== process.env.DBL_AUTHORIZATION) return res.status(401).end()
    console.log(req.body)
    const user = bot.users.cache.get(req.body.json().user)
    const embed = new MessageEmbed()
    let bonus
    if (req.body.json().isWeekend) {
      eco.add(`${req.body.json().user}.balance`, 15750)
      eco.add(`${req.body.json().user}.multiplier`, 8)
      bonus = true
    } else {
      eco.add(`${req.body.json().user}.balance`, 15000)
      eco.add(`${req.body.json().user}.multiplier`, 5)
      bonus = false
    }
    eco.set(`${req.body.json().user}.voted`, true)
    eco.push('unvotes', { user: req.body.json().user, unvoteAt: new Date().getTime() + 43200000, bonus: bonus })
    try {
      if (bonus) embed.addField('<:check:820704989282172960> Thanks for voting!', 'You receive the following perks while you have the voting perk: \n\n+ :coin: **15,750*\n+ :crown: **8% Multiplier**')
      else embed.addField('<:check:820704989282172960> Thanks for voting!', 'You receive the following perks while you have the voting perk: \n\n+ :coin: **15,000*\n+ :crown: **5% Multiplier**')
      embed.setFooter('These perks will expire when your vote renews again.')
      embed.setColor('#ff4747')
      user.send(embed)
    } catch {}  
    res.status(200).end()
  })
  
  app.listen(process.env.PORT, () => console.log(process.env.PORT))
}

module.exports.run = (bot) => {
  bot.logger.log('info', `Ready! Logged in as ${bot.user.username}#${bot.user.discriminator}`)
  console.log(chalk.black('────────────────────────────────────────────────────────────'))
  bot.user.setActivity('.help | .support', { type: 'LISTENING' })
  webServer(bot)
}