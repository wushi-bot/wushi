import { CommandInteraction, MessageActionRow, MessageButton } from 'discord.js'

import Bot from '../models/Client'
import Command from '../models/Command'

class InviteCommand extends Command {
  constructor() {
    super(
      'invite', 
      'Sends the invite URL to invite the bot to more servers.'
    )
  }

  async execute(interaction: CommandInteraction, client: Bot) {
    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setStyle('LINK')
          .setURL(`https://discord.com/api/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=939649088&scope=bot%20applications.commands`)
          .setLabel('Invite')
      )
    await interaction.reply({ content: `Invite **${interaction.client.user.username}** to more servers! (click the buttons below to invite me)`, ephemeral: true, components: [row] })
  }
}

module.exports = InviteCommand