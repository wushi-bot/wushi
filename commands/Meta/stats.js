import Command from '../../models/Command'
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
        .setColor('#0099ff')
        .setDescription(`:sushi: [wushi v${this.client.version} (**master/${com}**)](https://xMinota/wushi)\n──────────────────────\n • The bot is currently using **${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB** of memory.\n • And has been up for **${duration}**.\n • And can see **${this.client.users.cache.size.toLocaleString()}** users, **${this.client.guilds.cache.size.toLocaleString()}** guilds, **${this.client.channels.cache.size.toLocaleString()}** channels.\n • :sushi: [wushi](https://wushibot.xyz)'s running on **Node.js ${process.version}** & **Discord.js v${version}**\n • The bot has **${this.client.commands.array().length.toLocaleString()} commands**.`)
      return msg.channel.send(embed)
    })
  }
}

module.exports = StatsCommand
