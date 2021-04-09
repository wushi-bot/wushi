import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js'
 
class MineCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'mine',
      description: 'Get minerals and rocks by mining ores.',
      category: 'Economy',
      aliases: [],
      usage: 'mine',
      cooldown: 3.5
    })
  }

  async run (bot, msg, args) {
    if (!eco.get(`${msg.author.id}.started`)) {
      return this.client.emit('customError', 'You don\'t have a bank account!', msg)
    }
    const items = eco.get(`${msg.author.id}.items`) || []
    if (
      !items.includes('flimsy_pickaxe') && 
      !items.includes('decent_pickaxe') && 
      !items.includes('great_pickaxe')
    ) {
      return this.client.emit('customError', `You need a pickaxe to mine, purchase one on the store using \`${utils.getPrefix(msg.guild.id)}buy flimsy_pickaxe\`.`, msg)
    }
    
  }
}

module.exports = MineCommand