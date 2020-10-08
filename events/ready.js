const chalk = require('chalk')

module.exports.run = (bot) => {
  console.log(chalk.green('>') + ` Ready! Logged in as ${bot.user.username}#${bot.user.discriminator}`)
  bot.user.setActivity('with 🍣 | .help', { type: 'PLAYING' })
}
