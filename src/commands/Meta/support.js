import { MessageEmbed } from 'discord.js-light'
import Command from '../../structs/command'
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
    const embed = new MessageEmbed()
      .setColor(color)
      .setTitle(`:sushi: Join wushi support`)
      .setDescription(`Join [wushi support](https://discord.gg/zjqeYbNU5F)`)
    msg.reply(embed)
  }
}

module.exports = SupportCommand