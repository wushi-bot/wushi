import chalk from 'chalk'
import db from 'quick.db'

const cfg = new db.table('config')

exports.run = (bot, guild) => {
  bot.logger.log('info', `[Event] Joined ${guild.name}, ID ${guild.id}.`)
  if (!cfg.get(`${guild.id}.setup`)) {
    bot.logger.log('info', '[Event] Could not find proof of this server being setup, doing that now.')
    cfg.set(`${guild.id}.setup`, true)
    cfg.set(`${guild.id}.disabled`, ['Leveling'])
    cfg.set(`${guild.id}.levelUpMesage`, 'Congratulations, **{user.name}**, you\'ve leveled :up: to **Level {level}**!')
    bot.logger.log('info', '[Event] Successfully setup this guild.')
  } else {
    bot.logger.log('info', '[Event] This server has been configured before.')
  }
}
