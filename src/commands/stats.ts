import { CommandInteraction } from 'discord.js'
import { version } from 'discord.js'

import Bot from '../models/Client'
import Command from '../models/Command'

class StatsCommand extends Command {
  constructor() {
    super(
      'stats', 
      'Sends bot statistics.'
    )
  }

  async execute(interaction: CommandInteraction, client: Bot) {
    await interaction.reply({ content: `${interaction.client.user.username} is currently using **${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB** of memory & is using **wushi ${client.version}**, **Node.js ${process.version}**, **Discord.js ${version}**`, ephemeral: true })
  }
}

module.exports = StatsCommand