import { MessageEmbed, MessageButton, MessageActionRow } from 'discord.js'
import Command from '../../classes/Command'
import db from 'quick.db'
const cfg = new db.table('config')

class SupportCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'support',
      description: 'Sends an invite for the support server.',
      aliases: ['sup'],
      category: 'Meta',
      usage: 'support',
      cooldown: 1.5
    })
  }

  async run (bot, msg, args) {
    const color = cfg.get(`${msg.author.id}.color`) || msg.member.roles.highest.color
    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setLabel('Support')
          .setURL(`https://discord.gg/zjqeYbNU5F`)
          .setStyle('LINK')
      )
    const embed = new MessageEmbed()
      .setColor(color)
      .setTitle(`:sushi: Join wushi support`)
      .setDescription('Click the button below to join the support server.')
    msg.reply({ embeds: [embed], components: [row] })
    return true
  }
}

module.exports = SupportCommand