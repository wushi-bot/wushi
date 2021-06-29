import Command from '../../classes/Command'
import { MessageEmbed } from 'discord.js'
 
class SellCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'sell',
      description: 'Sell items in your inventory for cash.',
      category: 'Economy',
      aliases: ['se'],
      usage: 'sell <item> [amount/all]',
      cooldown: 10
    })
  }

  async run (bot, msg, args) {
    if (!eco.get(`${msg.author.id}.started`)) return this.client.emit('customError', 'You don\'t have a bank account!', msg)
    const color = cfg.get(`${msg.author.id}.color`) || msg.member.roles.highest.color
  }
}

module.exports = SellCommand