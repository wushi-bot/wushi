import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js-light'
import utils from '../../utils/utils' 

class RollCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'roll',
      description: 'Roll a dice',
      category: 'Utility',
      aliases: [],
      usage: 'roll',
      cooldown: 2.5
    })
  }

  async run (bot, msg, args) {
    const result = utils.getRandomInt(1, 7)
    const embed = new MessageEmbed()
      .setColor(msg.member.roles.highest.color)
    if (result === 1) { 
      embed.addField(':one: One', 'The dice landed on its one side up.')
    } else if (result === 2) {
      embed.addField(':two: Two', 'The dice landed on its two side up.')
    } else if (result === 3) {
      embed.addField(':three: Three', 'The dice landed on its three side up.')
    } else if (result === 4) {
      embed.addField(':four: Four', 'The dice landed on its four side up.')
    } else if (result === 5) {
      embed.addField(':five: Five', 'The dice landed on its five side up.')
    } else if (result === 6) {
      embed.addField(':six: Six', 'The dice landed on its six side up.')
    }
    msg.reply(embed)
  }
}

module.exports = RollCommand