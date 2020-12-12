import Command from '../../models/Command'
import { MessageEmbed } from 'discord.js'

class NekoCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'neko',
      description: 'Get neko images.',
      category: 'Images',
      aliases: ['cat-girl'],
      usage: 'neko',
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    const img = await this.client.ksoft.images.random('neko')
    const embed = new MessageEmbed()
      .setAuthor(msg.author.tag, msg.author.avatarURL())
      .setDescription('Here\'s the requested image for you!')
      .setColor('#ff73e1')
      .setFooter('Images provided by ksoft.si')
      .setImage(img.url)
    msg.channel.send(embed)
  }
}

module.exports = NekoCommand
