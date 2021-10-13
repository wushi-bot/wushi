import { CommandInteraction } from 'discord.js'

import Bot from '../models/Client'
import Command from '../models/Command'

class PingCommand extends Command {
  constructor() {
    super(
      'ping', 
      'Gets the bot\'s latency.'
    )
  }

  async execute(interaction: CommandInteraction, client: Bot) {
    await interaction.reply({ content: `My ping to Discord is estimated to be \`${Math.round(interaction.client.ws.ping)}ms\`.`, ephemeral: true })
  }
}

module.exports = PingCommand