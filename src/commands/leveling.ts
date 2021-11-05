import { CommandInteraction, MessageEmbed } from 'discord.js'
import { getGuild, getMember } from '../utils/database'


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
        .setName('rewards')
        .setDescription('Subcommands for rewards')
        .addSubcommand(subcommand => 
          subcommand
            .setName('add')
            .setDescription('Subcommand to reward roles upon gaining a level.')
            .addIntegerOption(option => 
              option
                .setName('requirement')
                .setDescription('Level requirement for getting a role.')
                .setRequired(true)
            )
            .addRoleOption(option => 
              option
                .setName('role')
                .setDescription('The role to reward for gaining provided level.')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => 
          subcommand
            .setName('remove')
            .setDescription('Remove a level reward using a role.')
            .addRoleOption(option => 
              option
                .setName('role')
                .setDescription('The role to remove.')
                .setRequired(true)  
            )  
        )
        .addSubcommand(subcommand => 
          subcommand
            .setName('list')
            .setDescription('Lists the level rewards in your server.')
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
    let group = interaction.options.getSubcommandGroup(false) // @ts-ignore
    if (!interaction.member.permissions.has('ADMINISTRATOR') && interaction.member.permissions.has('MANAGE_SERVER')) return await interaction.reply({ content: `${emojis.error} You do not have permission; you lack the \`MANAGE_SERVER\` or \`ADMINISTRATOR\` permission.` })
    if (!group) {
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
      }
    } else if (group === 'message') {
      let guild = await getGuild(interaction.guild)
      let member = await getMember(interaction.member.user.id, interaction.guild.id)
      if (interaction.options.getSubcommand() === 'preview') {
        let message = guild.levelUpMessage || 'Congratulations {user.name}, you leveled :up: to **Level {level}**!'
        let level = member.level || 0
        let expNeeded = member.expNeeded || 100
        message = message.replace('{level}', level)
        message = message.replace('{expRequirement}', expNeeded)
        message = message.replace('{user.mention}', `<@!${interaction.member.user.id}>`)
        message = message.replace('{user.name}', `${interaction.member.user.username}`)
        message = message.replace('{user.id}', `${interaction.member.user.id}`)
        message = message.replace('{user.tag}', `${interaction.member.user.username}#${interaction.member.user.discriminator}`)
        message = message.replace('{user.discrim}', `${interaction.member.user.discriminator}`)
        const embed = new MessageEmbed()
          .setColor('#303136')
          .addField(':sparkles: Preview', `${message}`)
        await interaction.reply({ embeds: [embed] })
      } else if (interaction.options.getSubcommand() === 'set') {
        let message = interaction.options.getString('message')
        guild.levelUpMessage = message
        await guild.save()
        await interaction.reply({ content: `${emojis.success} Successfully set your level up message to \`${message}\`!`})
      }
    } else if (group === 'rewards') {
      if (interaction.options.getSubcommand() === 'list') {
        let guild = await getGuild(interaction.guild)
        let rewards = guild.rewards
        const embed = new MessageEmbed()
          .setTitle(':sparkles: Leveling Rewards')
          .setColor('#303136')
        for (let reward of rewards) {
          embed.addField(`Requirement: Level ${reward.requirement}`, `Reward: <@&${reward.role}>`)
        }
        if (rewards.length === 0) embed.setDescription('There are no level rewards added! Add some using `/leveling rewards add`.')
        await interaction.reply({ embeds: [embed] })
      } else if (interaction.options.getSubcommand() === 'add') {
        let guild = await getGuild(interaction.guild)
        let requirement = interaction.options.getInteger('requirement')
        let role = interaction.options.getRole('role')
        let check = true
        let rewards = guild.rewards
        for (let reward of rewards) {
          if (reward.role === role.id) {
            check = false
            break
          }
        }
        if (!check) return await interaction.reply({ content: `${emojis.error} You already have this reward added.`, ephemeral: true })
        guild.rewards.push({ requirement: requirement, role: role.id })
        await guild.save()
        await interaction.reply({ content: `${emojis.success} Added the role **${role.name}** (${role.id}) as a reward achieving **Level ${requirement}**!`})
      } else if (interaction.options.getSubcommand() === 'remove') {
        let role = interaction.options.getRole('role')  
        let guild = await getGuild(interaction.guild)
        let result = guild.rewards.filter(reward => reward.role === role.id)
        if (result.length === 0) {
          return await interaction.reply({ content: `${emojis.error} Could not find that role in the level rewards list.`, ephemeral: true })
        }
        let indexToRemove = guild.rewards.indexOf(result)
        guild.rewards.splice(indexToRemove, 1)
        await guild.save()
        return await interaction.reply({ content: `${emojis.success} Successfully removed the level reward for <@&${result[0].role}> (Requirement: **Level ${result[0].requirement}**) ` })
      }
    }
  }  
}

module.exports = LevelingCommand 