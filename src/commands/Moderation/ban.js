import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js-light'
import ms from 'ms' 

import moderationUtils from '../../utils/moderation'
import db from 'quick.db'

const cfg = new db.table('config') 
const mod = new db.table('moderation') 

class BanCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'ban',
      description: 'Gets the bot\'s latency.',
      category: 'Moderation',
      aliases: ['b'],
      usage: 'ban <@user> <time> [reason]',
      cooldown: 3.5
    })
  }

  async run (bot, msg, args) {
    if (!args[0]) {
      return this.client.emit('customError', 'You need to provide arguments.', msg)
    }
    const admins = cfg.get(`${msg.guild.id}.admins`) || []
    const mods = cfg.get(`${msg.guild.id}.mods`) || []
    if (!msg.member.roles.cache.some(role => admins.includes(role.id)) && !msg.member.roles.cache.some(role => mods.includes(role.id)) && !msg.member.permissions.has('ADMINISTRATOR') && !msg.member.permissions.has('BAN_MEMBERS')) {
      return this.client.emit('customError', 'You do not have permission to execute this command.', msg)
    }
    const user = msg.guild.members.cache.get(args[0]) || msg.mentions.members.first()
    if (!user) {
      return this.client.emit('customError', 'I couldn\'t find this member.', msg)
    }
    if (user.roles.cache.some(role => admins.includes(role.id)) || user.roles.cache.some(role => mods.includes(role.id)) || user.permissions.has('ADMINISTRATOR') || user.permissions.has('BAN_MEMBERS')) {
      return this.client.emit('customError', 'This person cannot be kicked as they already have permissions or are an admin/mod.', msg)
    }
    let reason
    let time = args[1] 
    if (!args[1]) {
      reason = 'No reason specified'
    } else {
      if (!ms(time)) {
        reason = args[1] ? args.slice(1).join(' ') : 'No reason specified'
      } else {
        reason = args[2] ? args.slice(2).join(' ') : 'No reason specified'
        time = ms(time)
      }
    }
    const bans = mod.get(`unbans`) || []
    const prevCase = bans.filter(function (x) { return x.user === user.user.id && x.guild === msg.guild.id })[0] || undefined
    try {
      user.ban({ reason: 'Banning user' })
    } catch (e) {
      return this.client.emit('customError', 'wushi lacks permission to ban people.', msg)
    }
    mod.add(`${msg.guild.id}.cases`, 1)
    const embed = new MessageEmbed()
      .setColor(msg.member.roles.highest.color)
    if (prevCase) {
      let i = bans.indexOf(prevCase)
      bans.splice(i, 1)
      mod.set('unbans', bans)
      if (time) {
        embed.addField('<:check:820704989282172960> Success!', `Successfully banned **${user.user.username}#${user.user.discriminator}** for **${ms(time, { long: true })}**. (${reason})`)
        embed.setFooter('However, the previous case was removed.')
        moderationUtils.addUnban(msg.guild.id, user.user.id, msg.author.id, new Date().getTime() + time, mod.get(`${msg.guild.id}.cases`))
      } else {
        embed.addField('<:check:820704989282172960> Success!', `Successfully banned **${user.user.username}#${user.user.discriminator}** for **forever**. (${reason})`)
        embed.setFooter('However, the previous case was removed.')
        moderationUtils.addUnban(msg.guild.id, user.user.id, msg.author.id, -1, mod.get(`${msg.guild.id}.cases`))
      }
    } else {
      if (time) {
        embed.addField('<:check:820704989282172960> Success!', `Successfully banned **${user.user.username}#${user.user.discriminator}** for **${ms(time, { long: true })}**. (${reason})`)
        moderationUtils.addUnban(msg.guild.id, user.user.id, msg.author.id, new Date().getTime() + time, mod.get(`${msg.guild.id}.cases`))
      } else {
        embed.addField('<:check:820704989282172960> Success!', `Successfully banned **${user.user.username}#${user.user.discriminator}** for **forever**. (${reason})`)
        moderationUtils.addUnban(msg.guild.id, user.user.id, msg.author.id, -1, mod.get(`${msg.guild.id}.cases`))
      }
    }
    let t
    if (!time) {
      t = 'forever'
    } else {
      t = ms(time, { long: true })
    }
    if (cfg.get(`${msg.guild.id}.modLog`)) {
      const channel = msg.guild.channels.cache.get(cfg.get(`${msg.guild.id}.modLog`))
      const mlE = new MessageEmbed()
        .setColor('#ff9e1f')
        .setAuthor(`${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`, msg.author.avatarURL())
      if (t !== 'forever') {
        mlE.setDescription(`**User:** ${user.user.username}#${user.user.discriminator} (${user.user.id})\n**Action:** Ban\n**Reason:** ${reason}\n**Duration:** ${ms(time, { long: true })}`)
      } else {
        mlE.setDescription(`**User:** ${user.user.username}#${user.user.discriminator} (${user.user.id})\n**Action:** Ban\n**Reason:** ${reason}\n**Duration:** Forever`)
      }
      if (channel) channel.send(mlE)
    }
    msg.reply(embed)
  }
}

module.exports = BanCommand