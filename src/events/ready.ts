import Bot from "../models/Client";
import { AutoPoster } from 'topgg-autoposter'

import express from 'express'
import bodyParser from 'body-parser'

async function webServer(bot) {
  const app = express()
  app.use(bodyParser.json())
  app.use(express.json()) 
  app.use(express.urlencoded({ extended: true }))

  // Add web server related stuff.

  app.listen(process.env.PORT, () => {})
}

exports.run = async (bot: Bot) => {
  await webServer(bot)
  if (process.env.ENVIRONMENT === 'PRODUCTION') {
    AutoPoster(process.env.DBL_TOKEN, bot)
      .on('posted', () => {
        bot.logger.info('Posted stats to top.gg')
      })
  }
  bot.user.setActivity(`/invite | ${bot.guilds.cache.size} servers | ${bot.users.cache.size} users`, {
    type: 'PLAYING'
  })
  bot.logger.info(`Ready! Logged in as ${bot.user.username}#${bot.user.discriminator}`)
}