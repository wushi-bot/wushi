import Command from '../../models/Command'
import discord from 'discord.js'
import xkcd from 'xkcd'

class XKCD extends Command {
  constructor (client) {
    super(client, {
      name: 'xkcd',
      description: 'Generates the latest XKCD comic or a provided one.',
      aliases: ['xckd'],
      category: 'Util',
      usage: 'xkcd [comic id]',
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    args[0]
      ? xkcd(args[0], function (data) {
        const e = new discord.MessageEmbed()
          .setDescription(`[${data.title}](https://xkcd.com/${data.num})`)
          .setColor('#36393f')
          .setImage(data.img)
          .setFooter(`${data.alt}`)
          .setTimestamp()
        msg.channel.send(e)
      })
      : xkcd(function (data) {
        const e = new discord.MessageEmbed()
          .setDescription(`[${data.title}](https://xkcd.com/${data.num})`)
          .setColor('#36393f')
          .setImage(data.img)
          .setFooter(`${data.alt}`)
          .setTimestamp()
        msg.channel.send(e)
      })
  }
}

module.exports = XKCD
