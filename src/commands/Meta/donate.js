import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js'
 
class DonateCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'donate',
      description: 'Brings a donation link for the bot and describes the rewards.',
      category: 'Meta',
      aliases: ['donation'],
      usage: 'donate',
      cooldown: 0
    })
  }

  async run (bot, msg, args) {

  }
}

module.exports = DonateCommand