import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js'
 
import db from 'quick.db'
const eco = new db.table('economy')

class SellCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'sell',
      description: 'Allows you to sell your sack.',
      category: 'Economy',
      aliases: [],
      usage: 'sell',
      cooldown: 3.5
    })
  }

  async run (bot, msg, args) {
    
  }
}

module.exports = SellCommand