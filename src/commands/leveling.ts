import { CommandInteraction } from 'discord.js'
import { getGuild } from '../utils/database'


import Bot from '../models/Client'
import Command from '../models/Command'
import { emojis } from '../utils/constants'

class LevelingCommand extends Command {
  constructor() {
    super(
      'leveling', 
      'Toggles leveling in your server.'
    ),

    this.addSubcommand(subcommand => 
      subcommand
        .setName('enabled')
        .setDescription('Subcommand to toggle leveling in your server.')
        .addBooleanOption(option => 
          option
            .setName('boolean')
            .setDescription('The boolean to set leveling in your server.')
            .setRequired(false)
        )
    )

    this.addSubcommandGroup(subcommandGroup =>
      subcommandGroup
        .setName('message')
        .setDescription('Level-up message group')
        .addSubcommand(subcommand => 
          subcommand
            .setName('preview')
            .setDescription('Preview the level up message in your server.')
        )
        .addSubcommand(subcommand => 
          subcommand
            .setName('set')
            .setDescription('Set the level up message in your server.')
            .addStringOption(option => 
              option
                .setName('message')
                .setDescription('The message to set your level up message.')
                .setRequired(true)
            )
        )
    )
  }

  async execute(interaction: CommandInteraction, client: Bot) {
    let subcommandGroup = interaction.options.getSubcommandGroup() || 'nothing'
    console.log(subcommandGroup)
    if (interaction.options.getSubcommand() === 'enabled') {
      let enabled: Boolean
      let guild: any
      if (interaction.options.getBoolean('enabled')) {
        enabled = interaction.options.getBoolean('enabled')
        guild = await getGuild(interaction.guild)
        enabled ? guild.leveling = true : guild.leveling = false
        await guild.save()
      } else {
        guild = await getGuild(interaction.guild)
        enabled = !guild.leveling
        guild.leveling = !guild.leveling
        await guild.save()
      }
      await interaction.reply({ content: `${guild.leveling ? emojis.success : emojis.error} Successfully **${guild.leveling ? 'enabled' : 'disabled'}** leveling in **${interaction.guild.name}**.` })
    } else if (interaction.options.getSubcommand() === 'message') {

    } 
  }  
}

module.exports = LevelingCommand