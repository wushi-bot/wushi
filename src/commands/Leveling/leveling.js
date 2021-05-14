import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js-light'
import db from 'quick.db'

const cfg = new db.table('config')

class LevelingCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'leveling',
      description: 'Toggle leveling for your server.',
      category: 'Leveling',
      aliases: [],
      usage: 'leveling [on/off]',
      cooldown: 0
    })
  }

  async run (bot, msg, args) {
    const admins = cfg.get(`${msg.guild.id}.admins`) || []
    const mods = cfg.get(`${msg.guild.id}.mods`) || []
    if (!msg.member.roles.cache.some(role => admins.includes(role.id)) && !msg.member.roles.cache.some(role => mods.includes(role.id)) && !msg.member.permissions.has('ADMINISTRATOR') && !msg.member.permissions.has('MANAGE_SERVER')) {
      return this.client.emit('customError', 'You do not have permission to execute this command.', msg)
    }
    if (!args[0]) {
      if (cfg.get(`${msg.guild.id}.leveling`)) {
        cfg.set(`${msg.guild.id}.leveling`, false)
        const embed = new MessageEmbed()
          .setColor(msg.member.roles.highest.color)
          .addField('<:check:820704989282172960> Success!', `Successfully **disabled** leveling in **${msg.guild.name}**!`)
        return msg.reply(embed)
      } else if (!cfg.get(`${msg.guild.id}.leveling`)) {
        cfg.set(`${msg.guild.id}.leveling`, true)
        const embed = new MessageEmbed()
          .setColor(msg.member.roles.highest.color)
          .addField('<:check:820704989282172960> Success!', `Successfully **enabled** leveling in **${msg.guild.name}**!`)
        return msg.reply(embed)
      } 
    } else {
      if (args[0] !== 'on' && args[0] !== 'off') return this.client.emit('customError', 'You need to provide \`on\` or \`off\` as an argument.', msg)
      if (args[0] === 'on') {
        cfg.set(`${msg.guild.id}.leveling`, true)
        const embed = new MessageEmbed()
          .setColor(msg.member.roles.highest.color)
          .addField('<:check:820704989282172960> Success!', `Successfully **enabled** leveling in **${msg.guild.name}**!`)
        return msg.reply(embed)
      } else if (args[0] === 'off') {
        cfg.set(`${msg.guild.id}.leveling`, false)
        const embed = new MessageEmbed()
          .setColor(msg.member.roles.highest.color)
          .addField('<:check:820704989282172960> Success!', `Successfully **disabled** leveling in **${msg.guild.name}**!`)
        return msg.reply(embed)
      }
    }
  }
}

module.exports = LevelingCommand
