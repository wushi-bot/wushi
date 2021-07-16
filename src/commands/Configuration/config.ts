import { MessageEmbed } from 'discord.js'
import Command from '../../classes/Command'
import { getPrefix, getColor } from '../../utils/utils'
import { checkGuild } from '../../utils/database'

import Guild from '../../models/Guild'

class ConfigCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'config',
      description: 'Get the configuration for your server.',
      aliases: ['c'], 
      cooldown: 4.5,
      category: 'Configuration',
      usage: 'config'
    })
  }

  async run (bot, msg, args) {

    const color = await getColor(bot, msg.member)
    checkGuild(bot, msg.guild.id)
    const guilds = await Guild.find({
      id: msg.guild.id
    }).exec()

    const admins = guilds[0].admins || []
    const disabledCommands = guilds[0].disabledCommands || []
    const disabledModules = guilds[0].disabledModules || []

    const embed = new MessageEmbed()
      .setColor(color)
      .setTitle(`<:info:820704940682510449> ${msg.guild.name}'s Configuration`)
      .addField('<:slash:820751995824504913> Prefix', `The prefix for this server is \`${guilds[0].prefix}\``)

    if (disabledModules.length === 0) {
      embed.addField(':newspaper: Disabled Modules', `\`\`\`None\`\`\``)
    } else {
      embed.addField(':newspaper: Disabled Modules', `\`\`\`${disabledModules.join(', ')}\`\`\``)
    }

    if (disabledCommands.length === 0) {
      embed.addField(':newspaper: Disabled Commands', `\`\`\`None\`\`\``)
    } else {
      embed.addField(':newspaper: Disabled Commands', `\`\`\`${disabledCommands.join(', ')}\`\`\``)
    }
    
      
    if (admins.length === 0) {
      embed.addField('<:role:821012711403683841> Admins', `\`\`\`None\`\`\``)
    } else {
      let adminRoles = []
      admins.forEach(admin => {
        adminRoles.push(`<@&${admin}>`)
      })
      embed.addField('<:role:821012711403683841> Admins', `${adminRoles.join(', ')}`)
    }
      
    msg.reply({ embeds: [embed] })
    return true
  }
}

module.exports = ConfigCommand