import Command from '../../classes/Command'
import { MessageEmbed } from 'discord.js'
 
import ud from 'urban-dictionary'
import db from 'quick.db'
const cfg = new db.table('config')

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
    const color = cfg.get(`${msg.author.id}.color`) || msg.member.roles.highest.color
    if (!args[0]) {
      this.client.emit('customError', 'You need a word to define.', msg)
      return false
    }
    const word = args.join(' ')
    ud.define(word).then((results) => {
      const embed = new MessageEmbed()
        .addField(`Defining ${results[0].word}`, `**Definition:** ${results[0].definition}\n**Example:** ${results[0].example}`)
        .setFooter(`👍 ${results[0].thumbs_up} / 👎 ${results[0].thumbs_down}`)
        .setColor(color)
      msg.reply({ embeds: [embed] })
      return true
    })
    .catch(e => {
      this.client.emit('customError', `${e}`, msg)
      return false
    })
  }
}

module.exports = UrbanCommand