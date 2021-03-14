
module.exports.run = (bot) => {
  console.log(`Ready! Logged in as ${bot.user.username}#${bot.user.discriminator}`)
  bot.user.setActivity('you | .help', { type: 'WATCHING' })
}