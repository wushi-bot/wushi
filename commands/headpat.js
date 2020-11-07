import Command from '../models/Command'
import { MessageEmbed } from 'discord.js'

// .msndoswjbeepboopbop—-___283728

class HeadpatCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'headpat',
      description: 'Give headpats to someone.',
      category: 'Social',
      aliases: ['pat'],
      usage: 'headpat [@user]',
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    const user = msg.guild.members.cache.get(args[0]) || msg.mentions.members.first() || msg.member
    const img = await this.client.ksoft.images.random('pat')
    const embed = new MessageEmbed()
    if (user === msg.member) {
      embed.setDescription('You **patted** yourself! :heart: ||how sad!||')
    } else {
      embed.setDescription(`You **patted** ${user.user.username}! :heart:`)
    }
    embed.setColor('#ff73e1')
    embed.setFooter('Images provided by Ksoft.si')
    embed.setImage(img.url)
    msg.channel.send(embed)
  }
}

module.exports = HeadpatCommand
