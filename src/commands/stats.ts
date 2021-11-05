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
    await interaction.reply({ content: `:sushi: **${interaction.client.user.username}** is currently using **${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB** of memory & is using **wushi ${client.version}**, **Node.js ${process.version}**, **Discord.js ${version}**. ` + `${client.owners.includes(interaction.member.user.id) ? `The bot currently is caching **${client.users.cache.size.toLocaleString()}** users, **${client.guilds.cache.size.toLocaleString()}** guilds, **${client.channels.cache.size.toLocaleString()}** channels` : ' ' }`, ephemeral: true })
  }
}

module.exports = StatsCommand