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
    if (!eco.get(`${msg.guild.id}.${msg.author.id}.started`)) {
      return this.client.emit('customError', `You have no account setup in this server! Set one up using \`${utils.getPrefix(msg.guild.id)}start\`.`, msg)
    }
    const sack = eco.get(`${msg.guild.id}.${msg.author.id}.sack`) || []
  }
}

module.exports = SellCommand