import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js'
import ms from 'ms' 

import utils from '../../utils/utils'
import moderationUtils from '../../utils/moderation'
import db from 'quick.db'

const mod = new db.table('moderation')
const cfg = new db.table('config')


class MuteCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'mute',
      description: 'Mute the provided user for an amount of time.',
      category: 'Moderation',
      aliases: ['m'],
      usage: 'mute <@user> <time> [reason]',
      cooldown: 3.5
    })
  }

  async run (bot, msg, args) {
    if (!args[0]) {
      return this.client.emit('customError', 'You need to provide arguments.', msg)
    }
    const admins = cfg.get(`${msg.guild.id}.admins`) || []
    const mods = cfg.get(`${msg.guild.id}.mods`) || []
    if (!msg.member.roles.cache.some(role => admins.includes(role.id)) && !msg.member.roles.cache.some(role => mods.includes(role.id)) && !msg.member.permissions.has('ADMINISTRATOR') && !msg.member.permissions.has('MANAGE_ROLES')) {
      return this.client.emit('customError', 'You do not have permission to execute this command.', msg)
    }
    if (!cfg.get(`${msg.guild.id}.mutedRole`)) {
      return this.client.emit('customError', `Your server doesn't have a mute role setup, set one up using \`${utils.getPrefix(msg.guild.id)}muterole <@role>\`.`, msg)
    }
    const user = msg.guild.members.cache.get(args[0]) || msg.mentions.members.first()
    if (!user) {
      return this.client.emit('customError', 'I couldn\'t find this member.', msg)
    }
    if (user.roles.cache.some(role => admins.includes(role.id)) || user.roles.cache.some(role => mods.includes(role.id)) || user.permissions.has('ADMINISTRATOR') || user.permissions.has('MANAGE_ROLES')) {
      return this.client.emit('customError', 'This person cannot be muted as they already have permissions or are an admin/mod.', msg)
    }
    let reason
    let time = args[1] 
    if (!time) {
      reason = 'No reason specified'
    } else {
      if (!ms(time)) {
        reason = args[1] ? args.slice(1).join(' ') : 'No reason specified'
      } else {
        reason = args[2] ? args.slice(2).join(' ') : 'No reason specified'
        time = ms(time)
      }
    }
    const mutes = mod.get(`unmutes`)
    const prevCase = mutes.filter(function (x) { return x.user === user.user.id && x.guild === msg.guild.id })[0] || undefined
    try {
      user.roles.add(cfg.get(`${msg.guild.id}.mutedRole`))
    } catch (e) {
      return this.client.emit('customError', 'wushi lacks permission to add the muted role to people.', msg)
    }
    mod.add(`${msg.guild.id}.cases`, 1)
    const embed = new MessageEmbed()
      .setColor(msg.member.roles.highest.color)
    if (prevCase) {
      let i = mutes.indexOf(prevCase)
      mutes.splice(i, 1)
      mod.set('unmutes', mutes)
      if (time) {
        embed.addField('<:check:820704989282172960> Success!', `Successfully muted **${user.user.username}#${user.user.discriminator}** for **${ms(time, { long: true })}**. (${reason})`)
        embed.setFooter('However, the previous case was removed.')
        moderationUtils.addUnmute(msg.guild.id, user.user.id, msg.author.id, new Date().getTime() + time, mod.get(`${msg.guild.id}.cases`))
      } else {
        embed.addField('<:check:820704989282172960> Success!', `Successfully muted **${user.user.username}#${user.user.discriminator}** for **forever**. (${reason})`)
        embed.setFooter('However, the previous case was removed.')
        moderationUtils.addUnmute(msg.guild.id, user.user.id, msg.author.id, -1, mod.get(`${msg.guild.id}.cases`))
      }
    } else {
      if (time) {
        embed.addField('<:check:820704989282172960> Success!', `Successfully muted **${user.user.username}#${user.user.discriminator}** for **${ms(time, { long: true })}**. (${reason})`)
        moderationUtils.addUnmute(msg.guild.id, user.user.id, msg.author.id, new Date().getTime() + time, mod.get(`${msg.guild.id}.cases`))
      } else {
        embed.addField('<:check:820704989282172960> Success!', `Successfully muted **${user.user.username}#${user.user.discriminator}** for **forever**. (${reason})`)
        moderationUtils.addUnmute(msg.guild.id, user.user.id, msg.author.id, -1, mod.get(`${msg.guild.id}.cases`))
      }
    }
    if (cfg.get(`${msg.guild.id}.modLog`)) {
    const t = time || undefined
    const channel = msg.guild.channels.cache.get(cfg.get(`${msg.guild.id}.modLog`))
    const mlE = new MessageEmbed() 
      .setColor('#ff9e1f')
      .setAuthor(`${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`, msg.author.avatarURL())
    if (t) {
      mlE.setDescription(`**User:** ${user.user.username}#${user.user.discriminator} (${user.user.id})\n**Action:** Mute\n**Reason:** ${reason}\n**Duration:** ${ms(time, { long: true })}`)
    } else {
      mlE.setDescription(`**User:** ${user.user.username}#${user.user.discriminator} (${user.user.id})\n**Action:** Mute\n**Reason:** ${reason}\n**Duration:** Forever`)
    }
    channel.send(mlE)
    }
    msg.reply(embed)
  }
}

module.exports = MuteCommand