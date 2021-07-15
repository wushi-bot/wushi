import Command from '../../classes/Command'
import { MessageEmbed } from 'discord.js'
import { getPrefix, removeA, getColor } from '../../utils/utils'

import Guild from '../../models/Guild'
import User from '../../models/User'
import { checkGuild } from '../../utils/database'

class AdminRoleCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'admin-role',
      description: 'Configure/gets the admin roles.',
      aliases: ['admins', 'adminrole'], 
      cooldown: 1.5,
      category: 'Configuration',
      usage: 'adminrole [create|@role]'
    })
  }

  async run (bot, msg, args) {
    if (!msg.member.permissions.has('ADMINISTRATOR') && !msg.member.permissions.has('MANAGE_GUILD')) {
      this.client.emit('customError', 'You do not have permission to execute this command.', msg)
      return false
    }
    const color = await getColor(bot, msg.member)
    checkGuild(bot, msg.guild.id)
    const guilds = await Guild.find({
      id: msg.guild.id
    }).exec()
    if (!args[0]) {
      const admins = guilds[0].admins || []
      const roles = []
      if (admins.length !== 0) {
        admins.forEach(admin => {
          const role = msg.guild.roles.cache.find(r => r.id === admin)
          roles.push(role.name)
        })
      }
      const embed = new MessageEmbed()
        .setColor(color)
      if (roles.length === 0) {
        embed.addField('<:info:820704940682510449> Admins', `\`\`\`None\`\`\``)
      } else {
        embed.addField('<:info:820704940682510449> Admins', `\`\`\`${roles}\`\`\``)
      }
      embed.addField('<:role:821012711403683841> How to?', `Add an Admin via \`${getPrefix(msg.guild.id)}adminrole @Admin\`.`)
      msg.reply({ embeds: [embed] })
      return true
    } else {
      if (!msg.mentions.roles.first()) {
        const embed = new MessageEmbed()
          .setColor(color)
          .addField('<:role:821012711403683841> Role not found', 'You haven\'t inserted a valid role.')
        msg.reply({ embeds: [embed] })
        return false
      } else {
        const role = msg.mentions.roles.first()
        const admins = guilds[0].admins || []
        if (!admins.includes(role.id)) {
          guilds[0].admins.push(role.id)
          guilds[0].save()
          const embed = new MessageEmbed()
            .setColor(color)
            .addField(`<:check:820704989282172960> Success!`, `Successfully added <@&${role.id}> to the Admin Roles.`)
          msg.reply({ embeds: [embed] })
          return true
        } else { // @ts-ignore
          let i = removeA(admins, role.id) 
          guilds[0].admins = i
          guilds[0].save()
          const embed = new MessageEmbed()
            .setColor(color)
            .addField(`<:check:820704989282172960> Success!`, `Successfully removed <@&${role.id}> from the Admin Roles.`)
          msg.reply({ embeds: [embed] })
          return true
        }
      }
    }
  }
}

module.exports = AdminRoleCommand