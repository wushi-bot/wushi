import { MessageEmbed, MessageActionRow, MessageButton } from 'discord.js'
import Command from '../../classes/Command'

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
    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setLabel('Recommended permissions')
          .setURL(`https://discord.com/api/oauth2/authorize?client_id=${this.client.user.id}&permissions=3691375831&scope=bot`)
          .setStyle('LINK'),   
        new MessageButton()
          .setLabel('All permissions')
          .setURL(`https://discord.com/api/oauth2/authorize?client_id=${this.client.user.id}&permissions=8&scope=bot`)
          .setStyle('LINK'),             
      )
    const embed = new MessageEmbed()
      .setColor(color)
      .setTitle(`:sushi: Invite ${this.client.user.username}`)
      .setDescription('Click the buttons below to invite wushi to more servers.')
    msg.reply({ embeds: [embed], components: [row]})
    return true
  }
}

module.exports = InviteCommand