import { CommandInteraction, MessageActionRow, MessageButton } from 'discord.js'

import Bot from '../models/Client'
import Command from '../models/Command'

class DonateCommand extends Command {
  constructor() {
    super(
      'donate', 
      'Sends a donation link for the bot.'
    )
  }

  async execute(interaction: CommandInteraction, client: Bot) {
    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setStyle('LINK')
          .setURL(`https://ko-fi.com/minota`)
          .setLabel('Donate')
      )
    await interaction.reply({ content: `Donate to wushi here.`, ephemeral: true, components: [row] })
  }
}

module.exports = DonateCommand