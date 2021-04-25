import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js'
 
import ud from 'urban-dictionary'

class UrbanCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'urban',
      description: 'Gets the first definition of a word from Urban Dictionary.',
      category: 'Utility',
      aliases: ['ud'],
      usage: 'urban [word]',
      cooldown: 3.5
    })
  }

  async run (bot, msg, args) {
    if (!args[0]) return this.client.emit('customError', 'You need a word to define.', msg)
    const word = args.join(' ')
    ud.define(word).then((results) => {
      const embed = new MessageEmbed()
        .addField(`Defining ${results[0].word}`, `**Definition:** ${results[0].definition}\n**Example:** ${results[0].example}`)
        .setFooter(`👍 ${results[0].thumbs_up} / 👎 ${results[0].thumbs_down}`)
        .setColor(msg.member.roles.highest.color)
      msg.reply(embed)
    })
    .catch(e => {
      return this.client.emit('customError', `${e}`, msg)
    })
  }
}

module.exports = UrbanCommand