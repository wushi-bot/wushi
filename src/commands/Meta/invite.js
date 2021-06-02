import { MessageEmbed } from 'discord.js-light'
import Command from '../../structs/command'

import db from 'quick.db'
const cfg = new db.table('config')

class InviteCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'invite',
      description: 'Sends an invite to invite the bot to other servers.',
      aliases: ['i'],
      category: 'Meta',
      usage: 'invite',
      cooldown: 1.5
    })
  }

  async run (bot, msg, args) {
    const color = cfg.get(`${msg.author.id}.color`) || msg.member.roles.highest.color
    const embed = new MessageEmbed()
      .setColor(color)
      .setTitle(`:sushi: Invite ${this.client.user.username}`)
      .setDescription(`[Recommended permissions](https://discord.com/api/oauth2/authorize?client_id=${this.client.user.id}&permissions=3691375831&scope=bot) | [All permissions](https://discord.com/api/oauth2/authorize?client_id=${this.client.user.id}&permissions=8&scope=bot)`)
    msg.reply(embed)
    return true
  }
}

module.exports = InviteCommand