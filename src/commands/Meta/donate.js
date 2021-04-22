import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js'
 
class DonateCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'donate',
      description: 'Brings a donation link for the bot and describes the rewards.',
      category: 'Meta',
      aliases: ['donation'],
      usage: 'donate',
      cooldown: 0
    })
  }

  async run (bot, msg, args) {
    const embed = new MessageEmbed()
      .addField(':money_with_wings: Donate', 'Help support wushi by donating via [this URL](https://ko-fi.com/minota).')
      .setColor(msg.member.roles.highest.color)
    msg.reply(embed)
  }
}

module.exports = DonateCommand