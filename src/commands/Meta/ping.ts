import Command from '../../classes/Command'
import { MessageEmbed } from 'discord.js'

class PingCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'ping',
      description: 'Gets the bot\'s latency.',
      category: 'Meta',
      aliases: ['ping-pong', 'ms'],
      usage: 'ping',
      cooldown: 3.5
    })
  }

  async run (bot, msg, args) {
    const message = await msg.reply('🏓 Pinging...')
    const embed = new MessageEmbed()
      .setColor(msg.member.roles.highest.color)
      .setTitle(':ping_pong: Pong!')
      .addField('🕐 Roundtrip took', `${message.createdTimestamp - msg.createdTimestamp}ms`)
      .addField(`❤️ Heartbeat`, `${Math.round(this.client.ws.ping)}ms`)
    message.delete()
    msg.reply({ embeds: [embed] })
    return true
  }
}

module.exports = PingCommand