import Command from '../../models/Command'
import { MessageEmbed } from 'discord.js'

class AvatarCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'avatar',
      description: 'Gets a user\'s avatar.',
      category: 'Utility',
      aliases: ['avy', 'av', 'ava', 'user-avatar'],
      usage: 'avatar [user]',
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    const user = msg.guild.members.cache.get(args[0]) || msg.mentions.members.first() || msg.member
    if (!user) {
      const embed = new MessageEmbed()
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setDescription('<:WrongMark:767062695618543617> Please insert a valid user.')
        .setColor('#ff2803')
      return msg.channel.send(embed)
    }
    const embed = new MessageEmbed()
      .setAuthor(`${user.user.username}#${user.user.discriminator}`, user.user.avatarURL())
      .setColor(user.roles.highest.color)
      .setImage(`${user.user.avatarURL({ size: 2048 })}`)
      .setFooter(`Avatar ID: ${user.user.avatar}`)
      .setDescription(`[\`png\`](${user.user.avatarURL({ format: 'png', size: 2048 })}) | [\`jpg\`](${user.user.avatarURL({ format: 'jpg', size: 2048 })})  | [\`gif\`](${user.user.avatarURL({ format: 'gif', size: 2048 })}) | [\`webp\`](${user.user.avatarURL({ format: 'webp', size: 2048 })})`, true)
      .setTimestamp()
    return msg.channel.send(embed)
  }
}

module.exports = AvatarCommand
