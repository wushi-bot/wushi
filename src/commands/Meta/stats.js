
import axios from 'axios'
import moment from 'moment'
import { version, MessageEmbed } from 'discord.js'
import Command from '../../structs/command'
require('moment-duration-format')

class StatsCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'stats',
      description: 'Sends bot statistics.',
      aliases: [],
      category: 'Meta',
      usage: 'stats',
      cooldown: 1.5
    })
  }

  async run (bot, msg, args) {
    const duration = moment.duration(this.client.uptime).format(' D [days], H [hrs], m [mins], s [secs]')
    axios.get('https://api.github.com/repos/xMinota/wushi/commits').then(res => {
      const com = res.data[0].sha.slice(0, 6)
      const embed = new MessageEmbed()
        .setColor(msg.member.roles.highest.color)
        .addField(':brain: Memory' ,`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`)
        .addField(':clock1: Uptime', duration)
        .addField(':eyes: Cached', `**${this.client.users.cache.size.toLocaleString()}** users, **${this.client.guilds.cache.size.toLocaleString()}** guilds, **${this.client.channels.cache.size.toLocaleString()}** channels.`)
        .addField(':robot: Version', `wushi **v${this.client.version}** (\`${com}\`/master) is running on **Node.js ${process.version}** & **Discord.js-light v${version}**`)
        .addField(':speech_left: Commands', `The bot has **${this.client.commands.array().length.toLocaleString()} commands**.`)
      return msg.reply(embed)
    })
  }
}

module.exports = StatsCommand