import { CommandInteraction } from 'discord.js'
import { emojis } from '../utils/constants'

import Bot from '../models/Client'
import Command from '../models/Command'
import { getUser } from '../utils/database'

class ReputationCommand extends Command {
  constructor() {
    super(
      'reputation', 
      'Main command for reputation related commands..'
    ),
    this.addSubcommand(option => 
      option
        .setName('upvote')
        .setDescription('Subcommand for adding reputation to people.')
        .addUserOption(option =>
          option 
            .setName('user')
            .setDescription('User to add reputation to.')
            .setRequired(true)
        )  
    )
    this.addSubcommand(option => 
      option
        .setName('downvote')
        .setDescription('Subcommand for removing reputation to people.')
        .addUserOption(option =>
          option 
            .setName('user')
            .setDescription('User to removing reputation to.')
            .setRequired(true)
        )  
    )
  }

  async execute(interaction: CommandInteraction, client: Bot) {
    if (interaction.options.getSubcommand() === 'upvote') {
      let user = interaction.options.getUser('user')
      if (!user) return await interaction.reply({ content: `${emojis.error} You need to provide a user.` })
      if (interaction.member.user.id === user.id) return await interaction.reply({ content: `${emojis.error} You can't upvote yourself.` })
      let profile = await getUser(user.id)
      if (!profile.reputation) profile.reputation = {}
      if (profile.reputation[interaction.member.user.id]) return await interaction.reply({ content: `${emojis.error} You already have this user upvoted.` })
      profile.reputation[interaction.member.user.id] = true
      profile.markModified('reputation')
      await profile.save()
      await interaction.reply({ content: `${emojis.success} Successfully upvoted **${user.username}**!` })
    } else if (interaction.options.getSubcommand() === 'downvote') {
      let user = interaction.options.getUser('user')
      if (!user) return await interaction.reply({ content: `${emojis.error} You need to provide a user.` })
      if (interaction.member.user.id === user.id) return await interaction.reply({ content: `${emojis.error} You can't downvote yourself.` })
      let profile = await getUser(user.id)
      if (!profile.reputation) profile.reputation = {}
      if (profile.reputation[interaction.member.user.id] === false) return await interaction.reply({ content: `${emojis.error} You already have this user downvoted.` })
      profile.reputation[interaction.member.user.id] = false
      profile.markModified('reputation')
      await profile.save()
      await interaction.reply({ content: `${emojis.success} Successfully downvoted **${user.username}**!` })
    }
  }
}

module.exports = ReputationCommand