import Command from '../../classes/Command'
import { MessageEmbed } from 'discord.js'

import { getColor } from '../../utils/utils'
import ud from 'urban-dictionary'
import { MessageActionRow } from 'discord.js';
import { MessageButton } from 'discord.js';


function truncate( str, n, useWordBoundary ){
  if (str.length <= n) { return str; }
  const subString = str.substr(0, n-1); // the original check
  return (useWordBoundary 
    ? subString.substr(0, subString.lastIndexOf(" ")) 
    : subString) + "...";
}

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
    const color = await getColor(bot, msg.member)
    if (!args[0]) {
      this.client.emit('customError', 'You need a word to define.', msg)
      return false
    }
    const word = args.join(' ')
    ud.define(word).then((results) => {
      const row = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setLabel('Permalink')
            .setURL(results[0].permalink)
            .setStyle('LINK')   
        )
      const embed = new MessageEmbed()
        .setTitle(`Defining "${results[0].word}"`)
        .addField('Definition', `${truncate(results[0].definition, 1024, '...')}`)
        .addField('Example', `${truncate(results[0].example, 1024, '...')}`)
        .setFooter(`👍 ${results[0].thumbs_up} / 👎 ${results[0].thumbs_down}`)
        .setColor(color)
      msg.reply({ embeds: [embed], components: [row] })
      return true
    })
    .catch(e => {
      this.client.emit('customError', `${e}`, msg)
      return false
    })
  }
}

module.exports = UrbanCommand