import Command from '../models/Command'
import { version, MessageEmbed } from 'discord.js'
import moment from 'moment'
require('moment-duration-format')

class StatsCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'stats',
      description: 'Gives some useful bot statistics.',
      usage: 'stats',
      category: 'Meta',
      aliases: ['bot-stats'],
      cooldown: 1
    })
  }

  async run (bot, msg, args) { // eslint-disable-line no-unused-vars
    const duration = moment.duration(this.client.uptime).format(' D [days], H [hrs], m [mins], s [secs]')
    const embed = new MessageEmbed()
      .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
      .setDescription(':sushi: **My statistics**')
      .setColor('#0099ff')
      .addField('• Mem Usage', `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, true)
      .addField('• Uptime', `${duration}`, true)
      .addField('• Users', `${this.client.users.cache.size.toLocaleString()}`, true)
      .addField('• Servers', `${this.client.guilds.cache.size.toLocaleString()}`, true)
      .addField('• Channels', `${this.client.channels.cache.size.toLocaleString()}`, true)
      .addField('• Discord.js', `v${version}`, true)
      .addField('• Node.js', `${process.version}`, { code: 'asciidoc' }, true)
    return msg.channel.send(embed)
  }
}

module.exports = StatsCommand
