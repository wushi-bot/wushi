import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js-light'
import utils from '../../utils/utils'
import db from 'quick.db'
const cfg = new db.table('config') 

class ModRoleCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'mod-role',
      description: 'Configure/gets the mod roles.',
      aliases: ['mods', 'modrole'], 
      cooldown: 1.5,
      category: 'Configuration',
      usage: 'modrole [@role]'
    })
  }

  async run (bot, msg, args) {
    const admins = cfg.get(`${msg.guild.id}.admins`) || []
    if (!msg.member.roles.cache.some(role => admins.includes(role.id)) && !msg.member.permissions.has('ADMINISTRATOR') && !msg.member.permissions.has('MANAGE_GUILD')) {
      return this.client.emit('customError', 'You do not have permission to execute this command.', msg)
    }
    if (!args[0]) {
      const mods = cfg.get(`${msg.guild.id}.mods`) || []
      const roles = []
      mods.forEach(mod => {
        const role = msg.guild.roles.cache.get(mod)
        roles.push(role.name)
      })
      const embed = new MessageEmbed()
        .setColor(msg.member.roles.highest.color)
      if (roles.length === 0) {
        embed.addField('<:info:820704940682510449> Mods', `\`\`\`None\`\`\``)
      } else {
        embed.addField('<:info:820704940682510449> Mods', `\`\`\`${roles}\`\`\``)
      }
      embed.addField('<:role:821012711403683841> How to?', `Add a Mod via \`${utils.getPrefix(msg.guild.id)}modrole @Mod\`.`)
      msg.reply(embed)
    } else {
      if (!msg.mentions.roles.first()) {
        const embed = new MessageEmbed()
          .setColor(msg.member.roles.highest.color)
          .addField('<:role:821012711403683841> Role not found', 'You haven\'t inserted a valid role.')
        msg.reply(embed)
      } else {
        const role = msg.mentions.roles.first()
        const mods = cfg.get(`${msg.guild.id}.mods`) || []
        if (!mods.includes(role.id)) {
          cfg.push(`${msg.guild.id}.mods`, role.id)
          const embed = new MessageEmbed()
            .setColor(msg.member.roles.highest.color)
            .addField(`<:check:820704989282172960> Success!`, `Successfully added <@&${role.id}> to the Mod Roles.`)
          msg.reply(embed)
        } else {
          let i = utils.removeA(mods, role.id)
          cfg.set(`${msg.guild.id}.mods`, mods)
          const embed = new MessageEmbed()
            .setColor(msg.member.roles.highest.color)
            .addField(`<:check:820704989282172960> Success!`, `Successfully removed <@&${role.id}> from the Mod Roles.`)
          msg.reply(embed)
        }
      }
    }
  }
}

module.exports = ModRoleCommand