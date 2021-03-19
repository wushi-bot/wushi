import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js'
 
class CreateItemCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'create-item',
      description: 'Creates an item for your server shop.',
      category: 'Economy',
      aliases: ['createitem', 'ci'],
      usage: 'ping',
      cooldown: 3.5
    })
  }

  async run (bot, msg, args) {
    if (!args[0]) {
      return this.client
    }
  }
}

module.exports = PingCommand