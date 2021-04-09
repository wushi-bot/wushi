import chalk from 'chalk'

module.exports.run = (bot) => {
  bot.logger.log('info', `Ready! Logged in as ${bot.user.username}#${bot.user.discriminator}`)
  console.log(chalk.black('────────────────────────────────────────────────────────────'))
  bot.user.setActivity('.help | .support', { type: 'LISTENING' })
}