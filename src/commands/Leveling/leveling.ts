import Command from '../../classes/Command'
import { MessageEmbed } from 'discord.js'
import { getColor } from '../../utils/utils'
import Guild from '../../models/Guild'

class LevelingCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'leveling',
      description: 'Toggle leveling for your server.',
      category: 'Leveling',
      aliases: [],
      usage: 'leveling [on/off]',
      cooldown: 10
    })
  }

  async run (bot, msg, args) {
    const color = await getColor(bot, msg.member)
    const guild = await Guild.findOne({
      id: msg.guild.id
    }).exec()
    const admins = guild.admins || []
    const mods = guild.mods || []
    if (!msg.member.roles.cache.some(role => admins.includes(role.id)) && !msg.member.roles.cache.some(role => mods.includes(role.id)) && !msg.member.permissions.has('ADMINISTRATOR') && !msg.member.permissions.has('MANAGE_SERVER')) {
      this.client.emit('customError', 'You do not have permission to execute this command.', msg)
      return false
    }
    let leveling = guild.leveling || false
    if (!args[0]) {
      if (leveling) {
        guild.leveling = false
        guild.save()
        const embed = new MessageEmbed()
          .setColor(color)
          .addField('<:check:820704989282172960> Success!', `Successfully **disabled** leveling in **${msg.guild.name}**!`)
        msg.reply({ embeds: [embed] })
        return true
      } else if (!leveling) {
        guild.leveling = true
        guild.save()
        const embed = new MessageEmbed()
          .setColor(color)
          .addField('<:check:820704989282172960> Success!', `Successfully **enabled** leveling in **${msg.guild.name}**!`)
        msg.reply({ embeds: [embed] })
        return true
      } 
    } else {
      if (args[0] !== 'on' && args[0] !== 'off') {
        this.client.emit('customError', 'You need to provide \`on\` or \`off\` as an argument.', msg)
        return false
      }
      if (args[0] === 'on') {
        guild.leveling = true
        guild.save()
        const embed = new MessageEmbed()
          .setColor(color)
          .addField('<:check:820704989282172960> Success!', `Successfully **enabled** leveling in **${msg.guild.name}**!`)
        msg.reply({ embeds: [embed] })
        return true
      } else if (args[0] === 'off') {
        guild.leveling = false
        guild.save()
        const embed = new MessageEmbed()
          .setColor(color)
          .addField('<:check:820704989282172960> Success!', `Successfully **disabled** leveling in **${msg.guild.name}**!`)
        msg.reply({ embeds: [embed] })
        return true
      }
    }
  }
}

module.exports = LevelingCommand
