import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js-light'

import db from 'quick.db'
const eco = new db.table('economy')
 
class InventoryCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'inventory',
      description: 'See and view your inventory.',
      category: 'Economy',
      aliases: ['inv'],
      usage: 'inventory',
      cooldown: 2.5
    })
  }

  async run (bot, msg, args) {
    if (!eco.get(`${msg.author.id}.started`)) return this.client.emit('customError', 'You don\'t have a bank account!', msg)
    
  }
}

module.exports = InventoryCommand