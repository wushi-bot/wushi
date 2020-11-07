import Command from '../models/Command'
import { MessageEmbed } from 'discord.js'

class PepeCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'pepe',
      description: 'Get pepe images.',
      category: 'Images',
      aliases: ['pepe-the-frog'],
      usage: 'pepe',
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    const img = await this.client.ksoft.images.random('pepe')
    const embed = new MessageEmbed()
      .setAuthor(msg.author.tag, msg.author.avatarURL())
      .setDescription('Here\'s the requested image for you!')
      .setColor('#ff73e1')
      .setFooter('Images provided by Ksoft.si')
      .setImage(img.url)
    msg.channel.send(embed)
  }
}

module.exports = PepeCommand
