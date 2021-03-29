import { MessageEmbed } from 'discord.js'
import Command from '../../structs/command'

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
    const embed = new MessageEmbed()
      .setColor(msg.member.roles.highest.color)
      .setTitle(`:sushi: Invite ${this.client.user.username}`)
      .setDescription(`[Recommended permissions](https://discord.com/api/oauth2/authorize?client_id=${this.client.user.id}&permissions=3691375831&scope=bot) | [All permissions](https://discord.com/api/oauth2/authorize?client_id=${this.client.user.id}&permissions=8&scope=bot)`)
    msg.reply(embed)
  }
}

module.exports = InviteCommand