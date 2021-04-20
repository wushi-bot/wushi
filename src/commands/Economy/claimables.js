import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js'
 
class Command extends Command {
  constructor (client) {
    super(client, {
      name: 'name',
      description: 'description',
      category: 'Category',
      aliases: [],
      usage: 'usage',
      cooldown: 0
    })
  }

  async run (bot, msg, args) {

  }
}

module.exports = Command