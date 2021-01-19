import { updateStats } from '../utils/utils'

module.exports.run = (bot) => {
  bot.logger.log('info', `[Event] Ready! Logged in as ${bot.user.username}#${bot.user.discriminator}`)
  bot.user.setActivity('.help | wushibot.xyz', { type: 'PLAYING' })
  setInterval(async () => {
    if (bot.user.id === '755526238466080830') {
      await updateStats(bot.guilds.cache.size)
      bot.logger.log('runner', '[DBL] Updated guild stats on top.gg')
    }
  }, 3600000)
}
