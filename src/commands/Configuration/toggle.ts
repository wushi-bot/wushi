import Command from '../../classes/Command'
import { MessageEmbed } from 'discord.js'
import { 
  removeA, 
  getCategories, 
  getPrefix,
  toTitleCase
 } from '../../utils/utils'
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
    const color = cfg.get(`${msg.author.id}.color`) || msg.member.roles.highest.color
    const categories = getCategories()
    const module = toTitleCase(args[0].toLowerCase())
    if (categories.includes(module)) {
      if (module === 'Meta' || module === 'Configuration' || module === 'Admin') {
        this.client.emit('customError', 'You cannot disable this module.', msg)
        return false 
      }
      const disabledModules = cfg.get(`${msg.guild.id}.disabledModules`) || []
      const embed = new MessageEmbed()
        .setColor(color)
      if (!disabledModules.includes(module)) {
        cfg.push(`${msg.guild.id}.disabledModules`, module)
        embed.addField(`<:check:820704989282172960> Success!`, `Successfully disabled **${module}**.`)
        msg.reply(embed)
        return true
      } else { // @ts-ignore
        const newList = removeA(disabledModules, module)
        cfg.set(`${msg.guild.id}.disabledModules`, newList)
        embed.addField(`<:check:820704989282172960> Success!`, `Successfully enabled **${module}**.`)
        msg.reply(embed)
        return true
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
        ) {
          this.client.emit('customError', 'You cannot disable this command.', msg)
          return false
        }
      const disabledCommands = cfg.get(`${msg.guild.id}.disabledCommands`) || []
      const embed = new MessageEmbed()
        .setColor(color)
      if (disabledCommands.includes(command.conf.name)) { // @ts-ignore
        const newList = removeA(disabledCommands, command.conf.name)
        cfg.set(`${msg.guild.id}.disabledCommands`, newList)
        embed.addField(`<:check:820704989282172960> Success!`, `Successfully enabled **${getPrefix(msg.guild.id)}${command.conf.name}**.`)
        msg.reply(embed)
        return true
      } else {
        cfg.push(`${msg.guild.id}.disabledCommands`, command.conf.name)
        embed.addField(`<:check:820704989282172960> Success!`, `Successfully disabled **${getPrefix(msg.guild.id)}${command.conf.name}**.`)
        msg.reply(embed)
        return true
      }
    } else {
      this.client.emit('customError', 'You must provide a valid category or command.', msg)
      return false 
    }
  }
}

module.exports = ToggleCommand