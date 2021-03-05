import Command from '../../models/Command'
import discord from 'discord.js'

class XKCD extends Command {
  constructor (client) {
    super(client, {
      name: 'xkcd',
      description: 'Generates the latest XKCD comic or a provided one.',
      aliases: ['xckd'],
      category: 'Utility',
      usage: 'xkcd [id]',
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    let comic 
    if (!args[0]) {
      comic = await bot.xkcd.random()
    } else {
      comic = await bot.xkcd.id(args[0])
    }
    const e = new discord.MessageEmbed()
      .setAuthor(`[${comic.id}] ${comic.title}`, "", `https://xkcd.com/${comic.id}`)
      .setColor('#36393f')
      .setImage(comic.image)
      .setFooter(`${comic.text}`)
    msg.channel.send(e)
  }
}

module.exports = XKCD
