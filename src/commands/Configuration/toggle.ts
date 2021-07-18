import Command from '../../classes/Command'
import { MessageEmbed } from 'discord.js'
import { 
  removeA, 
  getCategories, 
  getPrefix,
  toTitleCase,
  getColor
 } from '../../utils/utils'
import Guild from '../../models/Guild'
import { checkGuild } from '../../utils/database'

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
    const color = await getColor(bot, msg.member)
    checkGuild(bot, msg.guild.id)
    const guild = await Guild.findOne({
      id: msg.guild.id
    }).exec()
    const prefix = await getPrefix(msg.guild.id)
    const admins = guild.admins || []
    if (!msg.member.roles.cache.some(role => admins.includes(role.id)) && !msg.member.permissions.has('ADMINISTRATOR') && !msg.member.permissions.has('MANAGE_GUILD')) {
      this.client.emit('customError', 'You do not have permission to execute this command.', msg)
      return false
    }
    const categories = getCategories()
    const module = toTitleCase(args[0].toLowerCase())
    if (categories.includes(module)) {
      if (module === 'Meta' || module === 'Configuration' || module === 'Admin') {
        this.client.emit('customError', 'You cannot disable this module.', msg)
        return false 
      }
      const disabledModules = guild.disabledModules || []
      const embed = new MessageEmbed()
        .setColor(color)
      if (!disabledModules.includes(module)) {
        guild.disabledModules.push(module)
        guild.save()
        embed.addField(`<:check:820704989282172960> Success!`, `Successfully disabled **${module}**.`)
        msg.reply({ embeds: [embed] })
        return true
      } else { // @ts-ignore
        const newList = removeA(disabledModules, module)
        guild.disabledModules = newList
        guild.save()
        embed.addField(`<:check:820704989282172960> Success!`, `Successfully enabled **${module}**.`)
        msg.reply({ embeds: [embed] })
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
      const disabledCommands = guild.disabledCommands || []
      const embed = new MessageEmbed()
        .setColor(color)
      if (disabledCommands.includes(command.conf.name)) { // @ts-ignore
        const newList = removeA(disabledCommands, command.conf.name)
        guild.disabledCommands = newList
        guild.save()
        embed.addField(`<:check:820704989282172960> Success!`, `Successfully enabled **${prefix}${command.conf.name}**.`)
        msg.reply({ embeds: [embed] })
        return true
      } else {
        guild.disabledCommands.push(command.conf.name)
        guild.save()
        embed.addField(`<:check:820704989282172960> Success!`, `Successfully disabled **${prefix}${command.conf.name}**.`)
        msg.reply({ embeds: [embed] })
        return true
      }
    } else {
      this.client.emit('customError', 'You must provide a valid category or command.', msg)
      return false 
    }
  }
}

module.exports = ToggleCommand