import Command from '../models/Command'
import { MessageEmbed } from 'discord.js'

class HugCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'hug',
      description: 'Give hugs to someone.',
      category: 'Social',
      aliases: ['cuddle'],
      usage: 'hug [@user]',
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    const user = msg.guild.members.cache.get(args[0]) || msg.mentions.members.first() || msg.member
    const img = await this.client.ksoft.images.random('hug')
    const embed = new MessageEmbed()
    if (user === msg.member) {
      embed.setDescription('You **hugged** yourself! :heart: ||how sad!||')
    } else {
      embed.setDescription(`You **hugged** ${user.user.username}! :heart:`)
    }
    embed.setColor('#ff73e1')
    embed.setFooter('Images provided by Ksoft.si')
    embed.setImage(img.url)
    msg.channel.send(embed)
  }
}

module.exports = HugCommand
