import Command from '../models/Command'
import { version, MessageEmbed } from 'discord.js'
import moment from 'moment'
import axios from 'axios'
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
    axios.get('https://api.github.com/repos/xMinota/wushi/commits').then(res => {
      const com = res.data[0].sha.slice(0, 6)
      const embed = new MessageEmbed()
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setDescription(`:sushi: **wushi's statistics** | **Latest GitHub Commit:** [\`${com}\`](${res.data[0].html_url})`)
        .setColor('#0099ff')
        .addField(':brain: Mem. Usage', `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, true)
        .addField(':alarm_clock: Uptime', `${duration}`, true)
        .addField(':bust_in_silhouette: Users', `${this.client.users.cache.size.toLocaleString()}`, true)
        .addField(':desktop: Servers', `${this.client.guilds.cache.size.toLocaleString()}`, true)
        .addField(':speech_balloon: Channels', `${this.client.channels.cache.size.toLocaleString()}`, true)
        .addField(':technologist: Discord.js', `v${version}`, true)
        .addField(':man_technologist: Node.js', `${process.version}`, true)
        .addField(':earth_americas: Version', `v${this.client.version}`, true)
      return msg.channel.send(embed)
    })
  }
}

module.exports = StatsCommand
