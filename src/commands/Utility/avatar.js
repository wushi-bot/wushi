import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js-light'

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
    if (!user) return this.client.emit('customError', 'Please insert a valid user.', msg)
    const embed = new MessageEmbed()
      .setColor(user.roles.highest.color)
      .setImage(`${user.user.avatarURL({ size: 2048, dynamic: true })}`)
      .setFooter(`Avatar ID: ${user.user.avatar}`)
      .setDescription(`[\`png\`](${user.user.avatarURL({ format: 'png', size: 2048 })}) | [\`jpg\`](${user.user.avatarURL({ format: 'jpg', size: 2048 })})  | [\`gif\`](${user.user.avatarURL({ format: 'gif', size: 2048 })}) | [\`webp\`](${user.user.avatarURL({ format: 'webp', size: 2048 })})`, true)
    return msg.reply(embed)
  }
}

module.exports = AvatarCommand