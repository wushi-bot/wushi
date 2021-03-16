import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js'
import db from 'quick.db'
const eco = new db.table('economy') 

class StartCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'start',
      description: 'Registers your bank account in the server.',
      category: 'Economy',
      aliases: [],
      usage: 'start',
      cooldown: 2.5
    })
  }

  async run (bot, msg, args) {
    const message = await msg.reply('🏓 Pinging...')
    const embed = new MessageEmbed()
      .setColor(msg.member.roles.highest.color)
      .setTitle(':ping_pong: Pong!')
      .addField('🕐 Roundtrip took', `${message.createdTimestamp - msg.createdTimestamp}ms`)
      .addField(`❤️ Heartbeat`, `${Math.round(this.client.ws.ping)}ms`)
    message.edit(embed)
  }
}

module.exports = StartCommand