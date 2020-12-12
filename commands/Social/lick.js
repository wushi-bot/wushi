import Command from '../../models/Command'
import { MessageEmbed } from 'discord.js'

class LickCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'lick',
      description: 'Give licks to someone.',
      category: 'Social',
      aliases: ['licks'],
      usage: 'lick [@user]',
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    const user = msg.guild.members.cache.get(args[0]) || msg.mentions.members.first() || msg.member
    const img = await this.client.ksoft.images.random('lick')
    const embed = new MessageEmbed()
    if (user === msg.member) {
      embed.setDescription('You **licked** yourself! :heart: ||how sad!||')
    } else {
      embed.setDescription(`You **licked** ${user.user.username}! :heart:`)
    }
    embed.setColor('#ff73e1')
    embed.setFooter('Images provided by Ksoft.si')
    embed.setImage(img.url)
    msg.channel.send(embed)
  }
}

module.exports = LickCommand
