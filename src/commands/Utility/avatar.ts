import Command from '../../classes/Command'
import { MessageEmbed } from 'discord.js'

import db from 'quick.db'
const cfg = new db.table('config')

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
    const color = cfg.get(`${msg.author.id}.color`) || msg.member.roles.highest.color
    const user = msg.guild.members.cache.get(args[0]) || msg.mentions.members.first() || msg.member
    if (!user) {
      this.client.emit('customError', 'Please insert a valid user.', msg)
      return false
    }
    const embed = new MessageEmbed()
      .setColor(color)
      .setImage(`${user.user.avatarURL({ size: 2048, dynamic: true })}`)
      .setFooter(`Avatar ID: ${user.user.avatar}`)
      .setDescription(`[\`png\`](${user.user.avatarURL({ format: 'png', size: 2048 })}) | [\`jpg\`](${user.user.avatarURL({ format: 'jpg', size: 2048 })})  | [\`gif\`](${user.user.avatarURL({ format: 'gif', size: 2048 })}) | [\`webp\`](${user.user.avatarURL({ format: 'webp', size: 2048 })})`)
    msg.reply({ embeds: [embed] })
    return true
  }
}

module.exports = AvatarCommand