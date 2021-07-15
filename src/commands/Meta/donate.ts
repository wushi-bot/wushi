import Command from '../../classes/Command'
import { MessageEmbed, MessageActionRow, MessageButton } from 'discord.js'
 
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
    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setLabel('Donate')
          .setURL('https://ko-fi.com/minota')
          .setStyle('LINK'),   
      )
    const embed = new MessageEmbed()
      .setTitle(':money_with_wings: Donate')
      .setDescription('Tap the button below to see the donation link.')
      .setColor(color)

    msg.reply({ embeds: [embed], components: [row] })
    return true
  }
}

module.exports = DonateCommand