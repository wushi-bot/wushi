import { CommandInteraction, MessageEmbed, GuildMember } from 'discord.js'
import moment from 'moment'
import req from '@aero/centra'

import Bot from '../models/Client'
import Command from '../models/Command'

const toTitleCase = str => str.charAt(0).toUpperCase() + str.slice(1)

class InfoCommand extends Command {
  constructor() {
    super(
      'info', 
      'Gets info about the provided object.'
    )
    this.addSubcommand(subcommand =>
      subcommand
        .setName('user')
        .setDescription('Gets info about a user')
        .addUserOption(option => option.setName('target').setDescription('The user to display information about')))
    this.addSubcommand(subcommand =>
      subcommand
        .setName('server')
        .setDescription('Gets info about a server')
    )
    this.addSubcommand(subcommand =>
      subcommand
        .setName('role')
        .setDescription('Gets info about a role')
        .addRoleOption(option => option.setName('target').setDescription('The role to display information about').setRequired(true))
    )
  }

  async execute(interaction: CommandInteraction, client: Bot) {
    if (interaction.options.getSubcommand() === 'user') {
      let user: GuildMember
      const guild = client.guilds.cache.get(interaction.guild.id)
      if (interaction.options.getUser('target')) {
        user = guild.members.cache.get(interaction.options.getUser('target').id)
      } else {
        user = guild.members.cache.get(interaction.user.id)
      }
      const joinDiscord = moment(user.user.createdAt).format('llll')
      const joinServer = moment(user.joinedTimestamp).format('llll')
      let res = await req(`https://ravy.org/api/v1/users/${user.user.id}/pronouns`, 'GET')
        .header('Authorization', process.env.RAVY_API)
        .json()
      const embed = new MessageEmbed()
        .setColor(user.displayHexColor)
        .setThumbnail(user.user.avatarURL({ format: 'png' }))
        .setAuthor(`${user.user.username}#${user.user.discriminator} (pronouns: ${res.pronouns})`, user.user.avatarURL())
        .addField(`Roles (${user.roles.cache.size})`, user.roles.cache.map(r => `${r}`).join(', '))
        .addField('Joined Discord at', joinDiscord)
        .addField('Joined Server at', joinServer)
        .setFooter(`ID: ${user.user.id} | Avatar ID: ${user.user.avatar}`)
        .addField('Avatar', `[\`png\`](${user.user.avatarURL({ format: 'png' })}) | [\`jpg\`](${user.user.avatarURL({ format: 'jpg' })})  | [\`gif\`](${user.user.avatarURL({ format: 'gif' })}) | [\`webp\`](${user.user.avatarURL({ format: 'webp' })})`)
      if (user.user.id === interaction.user.id && res.pronouns === 'unknown pronouns') {
        embed.setDescription('Set your pronouns via [PronounDB](https://pronoundb.org/me)!')
      }
      await interaction.reply({ embeds: [embed] })

    } else if (interaction.options.getSubcommand() === 'server') {
      const guild = interaction.guild
      const embed = new MessageEmbed()
        .setAuthor(guild.name, guild.iconURL({ format: 'png' }))
        .addField('Owner', `<@!${guild.ownerId}> (${guild.ownerId})`)
        .addField('Created at', `<t:${moment(guild.createdTimestamp).unix()}:D> (<t:${moment(guild.createdTimestamp).unix()}:R>)`)
        .addField('Members', `${interaction.guild.memberCount} members (${interaction.guild.members.cache.size} cached)`)
        .addField('Preferred locale', `${guild.preferredLocale}`)
        .setFooter(`ID: ${guild.id}`)
        .setColor('#303136')
      if (guild.rulesChannel) {
        embed.addField('Rules Channel', `<#${guild.rulesChannelId}>`)
      }
      await interaction.reply({ embeds: [embed] })
    } else if (interaction.options.getSubcommand() === 'role') {
      const role = interaction.options.getRole('target')
      const embed = new MessageEmbed()
        .setColor(role.color)
        .setAuthor(`@${role.name} (${role.id})`)
        .addField('Hoistable?', `${role.hoist ? 'Yes' : 'No'}`)
        .addField('Position', `${role.position}`)
      await interaction.reply({ embeds: [embed] })
    }
  }
}

module.exports = InfoCommand