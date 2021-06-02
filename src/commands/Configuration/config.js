import { MessageEmbed } from 'discord.js-light'
import Command from '../../structs/command'
import utils from '../../utils/utils'
import db from 'quick.db'
const cfg = new db.table('config')

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
    const admins = cfg.get(`${msg.guild.id}.admins`) || []
    const mods = cfg.get(`${msg.guild.id}.mods`) || []
    
    const disabledCommands = cfg.get(`${msg.guild.id}.disabledCommands`) || []
    const disabledModules = cfg.get(`${msg.guild.id}.disabledModules`) || []

    const color = cfg.get(`${msg.author.id}.color`) || msg.member.roles.highest.color
    const embed = new MessageEmbed()
      .setColor(color)
      .setTitle(`<:info:820704940682510449> ${msg.guild.name}'s Configuration`)
      .addField('<:slash:820751995824504913> Prefix', `The prefix for this server is \`${utils.getPrefix(msg.guild.id)}\``)

    if (disabledModules.length === 0) {
      embed.addField(':newspaper: Disabled Modules', `\`\`\`None\`\`\``)
    } else {
      embed.addField(':newspaper: Disabled Modules', `\`\`\`${cfg.get(`${msg.guild.id}.disabledModules`).join(', ')}\`\`\``)
    }

    if (disabledCommands.length === 0) {
      embed.addField(':newspaper: Disabled Commands', `\`\`\`None\`\`\``)
    } else {
      embed.addField(':newspaper: Disabled Commands', `\`\`\`${cfg.get(`${msg.guild.id}.disabledCommands`).join(', ')}\`\`\``)
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
    if (mods.length === 0) {
      embed.addField('<:role:821012711403683841> Mods', `\`\`\`None\`\`\``)
    } else {
      let modRoles = []
      mods.forEach(mod => {
        modRoles.push(`<@&${mod}>`)
      })
      embed.addField('<:role:821012711403683841> Mods', `${modRoles.join(', ')}`)
    }
      
    msg.reply(embed)
    return true
  }
}

module.exports = ConfigCommand