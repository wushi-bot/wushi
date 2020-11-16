import chalk from 'chalk'
import { updateStats } from '../utils/utils'

module.exports.run = (bot) => {
  console.log(chalk.green('>') + ` Ready! Logged in as ${bot.user.username}#${bot.user.discriminator}`)
  bot.user.setActivity('with 🍣 | .help', { type: 'PLAYING' })
  if (!bot.user.id === '755526238466080830') return
  setInterval(async () => {
    await updateStats(bot.guilds.cache.size)
    console.log(chalk.orange('>') + ' Updated guild stats on top.gg')
  }, 3600000)
}
