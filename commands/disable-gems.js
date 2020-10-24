import db from 'quick.db'
import Command from '../models/Command'
import { MessageEmbed } from 'discord.js'

const cfg = new db.table('config')

class DisableGems extends Command {
  constructor (client) {
    super(client, {
      name: 'disable-gems',
      description: 'Disable gems from leveling up.',
      category: 'Server Shop',
      aliases: ['disable-gem'],
      usage: 'disable-gem',
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    if (cfg.get(`${msg.guild.id}.disabled`).includes('Leveling')) {
      return msg.channel.send(':sparkles: `Leveling` must be enabled for this action.')
    }
    if (cfg.get(`${msg.guild.id}.levelUpGems`)) {
      cfg.set(`${msg.guild.id}.levelUpGems`, false)
      msg.channel.send('You will no longer receive gems for leveling up.')
    } else {
      cfg.set(`${msg.guild.id}.levelUpGems`, true)
      msg.channel.send('You will now receive gems for leveling up.')
    }
  }
}

module.exports = DisableGems
