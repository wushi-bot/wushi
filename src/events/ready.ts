import Bot from "../models/Client";
import { AutoPoster } from 'topgg-autoposter'

exports.run = async (bot: Bot) => {
  if (process.env.ENVIRONMENT === 'PRODUCTION') {
    AutoPoster(process.env.DBL_TOKEN, bot)
      .on('posted', () => {
        bot.logger.info('Posted stats to top.gg')
      })
  }
}