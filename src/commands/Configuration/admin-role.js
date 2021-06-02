import Command from '../../structs/command'
import { Message, MessageEmbed } from 'discord.js-light'
import utils from '../../utils/utils'
import db from 'quick.db'
const cfg = new db.table('config') 

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
      return this.client.emit('customError', 'You do not have permission to execute this command.', msg)
    }
    const color = cfg.get(`${msg.author.id}.color`) || msg.member.roles.highest.color
    if (!args[0]) {
      const admins = cfg.get(`${msg.guild.id}.admins`) || []
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
      embed.addField('<:role:821012711403683841> How to?', `Add an Admin via \`${utils.getPrefix(msg.guild.id)}adminrole @Admin\`.`)
      msg.reply(embed)
    } else {
      if (!msg.mentions.roles.first()) {
        const embed = new MessageEmbed()
          .setColor(color)
          .addField('<:role:821012711403683841> Role not found', 'You haven\'t inserted a valid role.')
        msg.reply(embed)
      } else {
        const role = msg.mentions.roles.first()
        const admins = cfg.get(`${msg.guild.id}.admins`) || []
        if (!admins.includes(role.id)) {
          cfg.push(`${msg.guild.id}.admins`, role.id)
          const embed = new MessageEmbed()
            .setColor(color)
            .addField(`<:check:820704989282172960> Success!`, `Successfully added <@&${role.id}> to the Admin Roles.`)
          msg.reply(embed)
        } else {
          let i = utils.removeA(admins, role.id)
          cfg.set(`${msg.guild.id}.admins`, admins)
          const embed = new MessageEmbed()
            .setColor(color)
            .addField(`<:check:820704989282172960> Success!`, `Successfully removed <@&${role.id}> from the Admin Roles.`)
          msg.reply(embed)
        }
      }
    }
  }
}

module.exports = AdminRoleCommand