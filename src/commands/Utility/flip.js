import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js'
import utils from '../../utils/utils' 

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
    const result = utils.getRandomInt(1, 3)
    const embed = new MessageEmbed()
      .setColor(msg.member.roles.highest.color)
    if (result === 2) { 
      embed.addField(':black_circle: Tails', 'The coin landed on tails.')
    } else if (result === 1) {
      embed.addField(':white_circle: Heads', 'The coin landed on heads.')
    }
    msg.reply(embed)
  }
}

module.exports = FlipCommand