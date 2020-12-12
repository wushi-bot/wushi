import Command from '../../models/Command'
import { MessageEmbed } from 'discord.js'

class WikihowCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'wikihow',
      description: 'Summons a wikihow from the depths of the underworld (Wikihow).',
      category: 'Images',
      aliases: ['wh'],
      usage: 'wikihow',
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    const img = await this.client.ksoft.images.wikihow()
    const embed = new MessageEmbed()
      .setAuthor(msg.author.tag, msg.author.avatarURL())
      .setDescription(`[${img.article.title}](${img.article.link})`)
      .setColor('#ff73e1')
      .setFooter('Images provided by Ksoft.si')
      .setImage(img.url)
    msg.channel.send(embed)
  }
}

module.exports = WikihowCommand
