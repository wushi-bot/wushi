import db from 'quick.db'
import Command from '../models/Command'
import { MessageEmbed } from 'discord.js'

const cfg = new db.table('config')

class RecommendedBots extends Command {
  constructor (client) {
    super(client, {
      name: 'recommended',
      description: 'Recommends 3 great bots made by great devs.',
      category: 'Meta',
      aliases: ['recommended-bots'],
      usage: 'recommended',
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    msg.channel.send('Recommended for moderation: https://carl.gg\nRecommended for complete server utility: https://fire.gaminggeek.dev\nRecommended for more modular advanced features: https://get.aero.bot')
  }
}

module.exports = RecommendedBots
