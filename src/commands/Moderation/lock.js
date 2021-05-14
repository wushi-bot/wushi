import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js-light'
import ms from 'ms' 

import moderationUtils from '../../utils/moderation'
import db from 'quick.db'

const mod = new db.table('moderation')
const cfg = new db.table('config')

class LockCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'lock',
      description: 'Locks the channel for a provided amount of time for a provided reason.',
      category: 'Moderation',
      aliases: ['l'],
      usage: 'lock [time] [reason]',
      cooldown: 3.5
    })
  }

  async run (bot, msg, args) {
    const admins = cfg.get(`${msg.guild.id}.admins`) || []
    const mods = cfg.get(`${msg.guild.id}.mods`) || []
    if (!msg.member.roles.cache.some(role => admins.includes(role.id)) && !msg.member.roles.cache.some(role => mods.includes(role.id)) && !msg.member.permissions.has('ADMINISTRATOR') && !msg.member.permissions.has('MANAGE_ROLES')) {
      return this.client.emit('customError', 'You do not have permission to execute this command.', msg)
    }
    const channel = msg.channel
    let reason
    let time = args[0] 
    if (!time) {
      reason = 'No reason specified'
      time = null
    } else {
      if (!ms(time)) {
        reason = args[0] ? args.slice(0).join(' ') : 'No reason specified'
      } else {
        reason = args[1] ? args.slice(1).join(' ') : 'No reason specified'
        time = ms(time)
      }
    }
    mod.add(`${msg.guild.id}.cases`, 1)
    const locks = mod.get(`unlocks`) || []
    const prevCase = locks.filter(function (x) { return x.channel === channel.id && x.guild === msg.guild.id })[0] || undefined
    try {
      channel.updateOverwrite(msg.guild.roles.everyone, {
        SEND_MESSAGES: false
      })
    } catch (e) {
      return this.client.emit('customError', 'wushi lacks permission to lock channels.', msg)
    }
    const embed = new MessageEmbed()
      .setColor(msg.member.roles.highest.color)
    if (prevCase) {
      let i = locks.indexOf(prevCase)
      locks.splice(i, 1)
      mod.set('unlocks', locks)
      if (time) {
        embed.addField('<:check:820704989282172960> Success!', `Successfully locked **<#${channel.id}>** for **${ms(time, { long: true })}**. (${reason})`)
        embed.setFooter('However, the previous case was removed.')
        moderationUtils.addUnlock(channel.id, msg.author.id, new Date().getTime() + time, mod.get(`${msg.guild.id}.cases`))
      } else {
        embed.addField('<:check:820704989282172960> Success!', `Successfully locked **<#${channel.id}>** for **forever**. (${reason})`)
        embed.setFooter('However, the previous case was removed.')
        moderationUtils.addUnlock(channel.id, msg.author.id, -1, mod.get(`${msg.guild.id}.cases`))
      }
    } else {
      if (time) {
        embed.addField('<:check:820704989282172960> Success!', `Successfully locked **<#${channel.id}>** for **${ms(time, { long: true })}**. (${reason})`)
        moderationUtils.addUnlock(msg.guild.id, channel.id, msg.author.id, new Date().getTime() + time, mod.get(`${msg.guild.id}.cases`))
      } else {
        embed.addField('<:check:820704989282172960> Success!', `Successfully locked **<#${channel.id}>** for **forever**. (${reason})`)
        moderationUtils.addUnlock(msg.guild.id, msg.author.id, -1, mod.get(`${msg.guild.id}.cases`))
      }
    }
    let t
    if (time) {
      t = ms(time, { long: true }) || 'forever'
    } else {
      t = 'forever'
    }
    if (cfg.get(`${msg.guild.id}.modLog`)) {
      const ml = msg.guild.channels.cache.get(cfg.get(`${msg.guild.id}.modLog`))
      const mlE = new MessageEmbed()
        .setColor('#ff9e1f')
        .setAuthor(`${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`, msg.author.avatarURL())
      if (t !== 'forever') {
        mlE.setDescription(`**Channel:** <#${channel.id}>\n**Action:** Lock\n**Reason:** ${reason}\n**Duration:** ${ms(time, { long: true })}`)
      } else {
        mlE.setDescription(`**Channel:** <#${channel.id}>\n**Action:** Lock\n**Reason:** ${reason}\n**Duration:** Forever`)
      }
      if (ml) ml.send(mlE)
    }
    msg.reply(embed)
  }
}

module.exports = LockCommand