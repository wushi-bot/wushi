import chalk from 'chalk'
import db from 'quick.db'

const cfg = new db.table('config')

exports.run = (bot, guild) => {
  console.log(chalk.gray('------------------'))
  console.log(chalk.blue('>') + ` Joined ${guild.name}, ID ${guild.id}.`)
  if (!cfg.get(`${guild.id}.setup`)) {
    console.log(chalk.blue('>') + ' Could not find proof of this server being setup, doing that now.')
    cfg.set(`${guild.id}.setup`, true)
    cfg.set(`${guild.id}.disabled`, ['Leveling'])
    console.log(chalk.green('>') + ' Successfully setup this guild.')
  } else {
    console.log(chalk.blue('>') + ' This server has been configurated before.')
  }
  console.log(chalk.gray('------------------'))
}
