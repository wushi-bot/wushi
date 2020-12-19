import Command from '../../models/Command'
import { MessageEmbed } from 'discord.js'

class BirbCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'birb',
      description: 'Get birb images.',
      category: 'Images',
      aliases: ['bird'],
      usage: 'birb',
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    const img = await this.client.ksoft.images.random('birb')
    const embed = new MessageEmbed()
      .setAuthor(msg.author.tag, msg.author.avatarURL())
      .setDescription('Here\'s the requested image for you!')
      .setColor('#ff73e1')
      .setFooter('Images provided by ksoft.si')
      .setImage(img.url)
    msg.channel.send(embed)
  }
}

module.exports = BirbCommand
