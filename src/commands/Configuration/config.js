import { MessageEmbed } from 'discord.js'
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
    const modLog = cfg.get(`${msg.guild.id}.modLog`) || 'Not set'
    const mutedRole = cfg.get(`${msg.guild.id}.mutedRole`) || 'Not set'
    const admins = cfg.get(`${msg.guild.id}.admins`) || []
    const mods = cfg.get(`${msg.guild.id}.mods`) || []
    const embed = new MessageEmbed()
      .setColor(msg.member.roles.highest.color)
      .setTitle(`<:info:820704940682510449> ${msg.guild.name}'s Configuration`)
      .addField('<:slash:820751995824504913> Prefix', `The prefix for this server is \`${utils.getPrefix(msg.guild.id)}\``)
    if (modLog !== 'Not set') {
      embed.addField('<:channel:821178111184863272> Mod-log', `The mod-log for this server is <#${modLog}>.`)
    } else {
      embed.addField('<:channel:821178111184863272> Mod-log', `The mod-log for this server is **${modLog}**.`)
    } 
     
    if (mutedRole === 'Not set') {
      embed.addField('<:role:821012711403683841> Muted role', `The mute role for this server is \`Not set\`.`)
    } else {
      embed.addField('<:role:821012711403683841> Muted role', `The mute role for this server is <@&${mutedRole}>.`)
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
    if (cfg.get(`${msg.guild.id}.levelUpMessage`)) {
      embed.addField(':sparkles: Level Up Message', `This message will show up when you level up, change it using \`${utils.getPrefix(msg.guild.id)}level-message <message>\`, to get a list of variables, [click here](https://docs.wushibot.xyz/variables). \`\`\`${config.get(`${msg.guild.id}.levelUpMessage`)}\`\`\``)
    } else {
      embed.addField(':sparkles: Level Up Message', `This message will show up when you level up, change it using \`${utils.getPrefix(msg.guild.id)}level-message <message>\`, to get a list of variables, [click here](https://docs.wushibot.xyz/variables). \`\`\`Congratulations, **{user.name}**, you've leveled :up: to **Level {level}**!\`\`\``)
    }
      
    msg.reply(embed)
  }
}

module.exports = ConfigCommand