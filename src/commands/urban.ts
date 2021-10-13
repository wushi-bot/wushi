import { CommandInteraction, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js'
import ud from 'urban-dictionary'

import Bot from '../models/Client'
import Command from '../models/Command'

function truncate( str, n, useWordBoundary ){
  if (str.length <= n) { return str; }
  const subString = str.substr(0, n-1); // the original check
  return (useWordBoundary 
    ? subString.substr(0, subString.lastIndexOf(" ")) 
    : subString) + "...";
}

class UrbanCommand extends Command {
  constructor() {
    super(
      'urban', 
      'Gets the first definition of a word from Urban Dictionary.'
    )
    this.addStringOption(option =>
      option
        .setName('query')
        .setDescription('The word to look up on the Urban Dictionary')
        .setRequired(true)
    )
  }

  async execute(interaction: CommandInteraction, client: Bot) {
    const embed = new MessageEmbed()
      .setColor('#303136')
    ud.define(interaction.options.getString('query')).then(async (results) => {
      const row = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setLabel('Permalink')
            .setURL(results[0].permalink)
            .setStyle('LINK')   
      )
      embed
        .addField('Definition', `${truncate(results[0].definition, 1024, '...')}`)
        .addField('Example', `${truncate(results[0].example, 1024, '...')}`)
        .setFooter(`Defining "${results[0].word}" | 👍 ${results[0].thumbs_up} / 👎 ${results[0].thumbs_down}`)
      await interaction.reply({ embeds: [embed], components: [row] })
    })
  }
}

module.exports = UrbanCommand