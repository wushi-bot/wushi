import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js-light'
import utils from '../../utils/utils'
import db from 'quick.db'

const cfg = new db.table('config')

class ToggleCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'toggle',
      description: 'Toggle a command or module.',
      category: 'Configuration',
      aliases: ['to'],
      usage: 'toggle <module/command>',
      cooldown: 3.5
    })
  }

  async run (bot, msg, args) {
    if (!args[0]) return this.client.emit('customError', 'You need to provide arguments.', msg)
    const categories = utils.getCategories()
    const module = utils.toTitleCase(args[0].toLowerCase())
    if (categories.includes(module)) {
      if (module === 'Meta' || module === 'Configuration' || module === 'Admin') return this.client.emit('customError', 'You cannot disable this module.', msg)
      const disabledModules = cfg.get(`${msg.guild.id}.disabledModules`) || []
      const embed = new MessageEmbed()
        .setColor(msg.member.roles.highest.color)
      if (!disabledModules.includes(module)) {
        cfg.push(`${msg.guild.id}.disabledModules`, module)
        embed.addField(`<:check:820704989282172960> Success!`, `Successfully disabled **${module}**.`)
        return msg.reply(embed)
      } else {
        const newList = utils.removeA(disabledModules, module)
        cfg.set(`${msg.guild.id}.disabledModules`, newList)
        embed.addField(`<:check:820704989282172960> Success!`, `Successfully enabled **${module}**.`)
        return msg.reply(embed)
      }
    } else if (this.client.commands.has(args[0]) || this.client.aliases.has(args[0])) {
      let command = this.client.commands.get(args[0])
      if (!command) {
        let c = this.client.aliases.get(args[0])
        command = this.client.commands.get(c)
      }
      if (
        command.conf.category === 'Meta' || 
        command.conf.category === 'Configuration' || 
        command.conf.category === 'Admin'
        ) return this.client.emit('customError', 'You cannot disable this command.', msg)
      const disabledCommands = cfg.get(`${msg.guild.id}.disabledCommands`) || []
      const embed = new MessageEmbed()
        .setColor(msg.member.roles.highest.color)
      if (disabledCommands.includes(command.conf.name)) {
        const newList = utils.removeA(disabledCommands, command.conf.name)
        cfg.set(`${msg.guild.id}.disabledCommands`, newList)
        embed.addField(`<:check:820704989282172960> Success!`, `Successfully enabled **${utils.getPrefix(msg.guild.id)}${command.conf.name}**.`)
        return msg.reply(embed)
      } else {
        cfg.push(`${msg.guild.id}.disabledCommands`, command.conf.name)
        embed.addField(`<:check:820704989282172960> Success!`, `Successfully disabled **${utils.getPrefix(msg.guild.id)}${command.conf.name}**.`)
        return msg.reply(embed)
      }
    } else return this.client.emit('customError', 'You must provide a valid category or command.', msg)
  }
}

module.exports = ToggleCommand