import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js'
 
class BanCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'ban',
      description: 'Gets the bot\'s latency.',
      category: 'Moderation',
      aliases: ['b'],
      usage: 'ban <@user> <time> [reason]',
      cooldown: 3.5
    })
  }

  async run (bot, msg, args) {

  }
}

module.exports = BanCommand