import { CommandInteraction, MessageActionRow, MessageButton } from 'discord.js'

import Bot from '../models/Client'
import Command from '../models/Command'

class SupportCommand extends Command {
  constructor() {
    super(
      'support', 
      'Sends you the support server link.'
    )
  }

  async execute(interaction: CommandInteraction, client: Bot) {
    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setStyle('LINK')
          .setURL(`https://discord.gg/zjqeYbNU5F`)
          .setLabel('Support')
      )
    await interaction.reply({ content: `Join the support server for wushi here.`, ephemeral: true, components: [row] })
  }
}

module.exports = SupportCommand