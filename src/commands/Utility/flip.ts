import Command from '../../classes/Command'
import { MessageEmbed } from 'discord.js'
import { getRandomInt } from '../../utils/utils' 

import db from 'quick.db'
const cfg = new db.table('config')

class FlipCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'flip',
      description: 'Flips a coin',
      category: 'Utility',
      aliases: [],
      usage: 'flip',
      cooldown: 2.5
    })
  }

  async run (bot, msg, args) {
    const color = cfg.get(`${msg.author.id}.color`) || msg.member.roles.highest.color
    const result = getRandomInt(1, 3)
    const embed = new MessageEmbed()
      .setColor(color)
    if (result === 2) { 
      embed.addField(':black_circle: Tails', 'The coin landed on tails.')
    } else if (result === 1) {
      embed.addField(':white_circle: Heads', 'The coin landed on heads.')
    }
    msg.reply({ embeds: [embed] })
    return true
  }
}

module.exports = FlipCommand