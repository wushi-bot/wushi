import Command from '../models/Command'
import { MessageEmbed } from 'discord.js'

class KappaCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'kappa',
      description: 'Get kappa images.',
      category: 'Images',
      aliases: [],
      usage: 'kappa',
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    const img = await this.client.ksoft.images.random('kappa')
    const embed = new MessageEmbed()
      .setAuthor(msg.author.tag, msg.author.avatarURL())
      .setDescription('Here\'s the requested image for you!')
      .setColor('#ff73e1')
      .setFooter('Images provided by Ksoft.si')
      .setImage(img.url)
    msg.channel.send(embed)
  }
}

module.exports = KappaCommand
