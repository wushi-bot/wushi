const discord = require('discord.js')
const chalk = require('chalk')
const db = require('quick.db')

const cfg = new db.table('config')

exports.run = (bot, guild) => {

  console.log(chalk.gray('------------------'))
  console.log(chalk.blue('>') + ` Joined ${guild.name}, ID ${guild.id}.`)
  if (!cfg.get(`${guild.id}.setup`)) {
    console.log(chalk.blue('>') + ' Could not find proof of this server being setup, doing that now.')
    cfg.set(`${guild.id}.setup`, true)
    cfg.set(`${guild.id}.disabled`, ['Leveling', 'Server Shop'])
  } else {
    console.log(chalk.blue('>') + 'This server has been configurated before.')
  }
  console.log(chalk.gray('------------------'))
}
