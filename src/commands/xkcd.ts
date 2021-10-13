import { CommandInteraction, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js'

import Bot from '../models/Client'
import Command from '../models/Command'

class XKCDCommand extends Command {
  constructor() {
    super(
      'xkcd', 
      'Provides a random XKCD comic or the desired one.'
    )
    this.addIntegerOption(option =>
      option
        .setName('id')
        .setDescription('The comic ID to display')
        .setRequired(false)
    )
  }

  async execute(interaction: CommandInteraction, client: Bot) {
    let comic
    if (interaction.options.getInteger('id')) {
      comic = await client.xkcdClient.id(interaction.options.getInteger('id'))
    } else {
      comic = await client.xkcdClient.random()
    }
    const embed = new MessageEmbed()
      .setTitle(comic.title)
      .setDescription(comic.text)
      .setImage(comic.image)
      .setColor('#303136')
      .setFooter(`Comic ID: ${comic.id}`)
    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setStyle('LINK')
          .setURL(comic.url)
          .setLabel('Link to Comic')
      )
    return await interaction.reply({ content: 'Here\'s the requested comic!', embeds: [embed], components: [row] })
  }
}

module.exports = XKCDCommand