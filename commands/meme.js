import Command from '../models/Command'
import { MessageEmbed } from 'discord.js'
import { addCommas } from '../utils/utils'

class MemeCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'meme',
      description: 'Summons a meme from the depths of the underworld (Reddit).',
      category: 'Images',
      aliases: ['plsmem', 'mem'],
      usage: 'meme',
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    const img = await this.client.ksoft.images.meme()
    console.log(img)
    const embed = new MessageEmbed()
      .setAuthor(msg.author.tag, msg.author.avatarURL())
      .setDescription(`[${img.post.title}](${img.post.link})`)
      .setColor('#ff73e1')
      .setFooter(`👍 ${addCommas(img.post.upvotes)} / 👎 ${addCommas(img.post.downvotes)} | Images provided by Ksoft.si`)
      .setImage(img.url)
    msg.channel.send(embed)
  }
}

module.exports = MemeCommand
