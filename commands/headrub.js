import Command from '../models/Command'
import { MessageEmbed } from 'discord.js'

class HeadrubCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'headrub',
      description: 'Give headrubs to someone.',
      category: 'Social',
      aliases: ['rub'],
      usage: 'headrub [@user]',
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    const user = msg.guild.members.cache.get(args[0]) || msg.mentions.members.first() || msg.member
    const img = await this.client.ksoft.images.random('headrub')
    const embed = new MessageEmbed()
    if (user === msg.member) {
      embed.setDescription('You **rubbed** your own head! :heart: ||how sad!||')
    } else {
      embed.setDescription(`You **rubbed** ${user.user.username}'s head! :heart:`)
    }
    embed.setColor('#ff73e1')
    embed.setFooter('Images provided by Ksoft.si')
    embed.setImage(img.url)
    msg.channel.send(embed)
  }
}

module.exports = HeadrubCommand
