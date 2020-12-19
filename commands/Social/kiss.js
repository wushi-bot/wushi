import Command from '../../models/Command'
import { MessageEmbed } from 'discord.js'

class KissCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'kiss',
      description: 'Give kisses to someone.',
      category: 'Social',
      aliases: ['kith', 'smooch'],
      usage: 'kiss [@user]',
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    const user = msg.guild.members.cache.get(args[0]) || msg.mentions.members.first() || msg.member
    const img = await this.client.ksoft.images.random('kiss')
    const embed = new MessageEmbed()
    if (user === msg.member) {
      embed.setDescription('You **kissed** yourself! :heart: ||how sad!||')
    } else {
      embed.setDescription(`You **kissed** ${user.user.username}! :kiss:`)
    }
    embed.setColor('#ff73e1')
    embed.setFooter('Images provided by Ksoft.si')
    embed.setImage(img.url)
    msg.channel.send(embed)
  }
}

module.exports = KissCommand
