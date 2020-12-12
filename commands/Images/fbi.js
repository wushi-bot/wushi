import Command from '../../models/Command'
import { MessageEmbed } from 'discord.js'

class FBICommand extends Command {
  constructor (client) {
    super(client, {
      name: 'fbi',
      description: 'Get FBI images.',
      category: 'Images',
      aliases: ['fbi'],
      usage: 'fbi',
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    const img = await this.client.ksoft.images.random('fbi')
    const embed = new MessageEmbed()
      .setAuthor(msg.author.tag, msg.author.avatarURL())
      .setDescription('Here\'s the requested image for you!')
      .setColor('#ff73e1')
      .setFooter('Images provided by ksoft.si')
      .setImage(img.url)
    msg.channel.send(embed)
  }
}

module.exports = FBICommand
