import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js-light'
 
import db from 'quick.db'
const cfg = new db.table('config')

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
    const color = cfg.get(`${msg.author.id}.color`) || msg.member.roles.highest.color
    const embed = new MessageEmbed()
      .addField(':money_with_wings: Donate', 'Help support wushi by donating via [this URL](https://ko-fi.com/minota).')
      .setColor(color)
    msg.reply(embed)
    return true
  }
}

module.exports = DonateCommand