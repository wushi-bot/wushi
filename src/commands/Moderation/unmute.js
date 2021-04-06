import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js'
import db from 'quick.db'

import utils from '../../utils/utils'

const cfg = new db.table('config')
const mod = new db.table('moderation')

class UnmuteCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'unmute',
      description: 'Unmutes the provided user with the provided reason.',
      category: 'Moderation',
      aliases: ['um'],
      usage: 'unmute <@user> [reason]',
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
    let reason = args[1] ? args.slice(1).join(' ') : 'No reason specified'
    const role = msg.guild.roles.cache.get(cfg.get(`${msg.guild.id}.mutedRole`)) || null
    if (!role) {
      return this.client.emit('customError', `I couldn't find the Muted role, please reconfigure it using \`${utils.getPrefix(msg.guild.id)}muterole create\`.`, msg)
    }
    try {
      user.roles.remove(role, 'Unmuting user')
    } catch (e) {
      return this.client.emit('customError', 'wushi lacks permission to add the muted role to people.', msg)
    }
    mod.add(`${msg.guild.id}.cases`, 1)
    const embed = new MessageEmbed()
      .setColor(msg.member.roles.highest.color)
      .addField('<:check:820704989282172960> Success!', `Successfully unmuted **${user.user.username}#${user.user.discriminator}**. (${reason})`)
    msg.reply(embed)
    if (cfg.get(`${msg.guild.id}.modLog`)) {
      const channel = msg.guild.channels.cache.get(cfg.get(`${msg.guild.id}.modLog`))
      const mlE = new MessageEmbed()
        .setColor('#5ca5e0')
        .setAuthor(`${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`, msg.author.avatarURL())
        .setDescription(`**User:** ${user.user.username}#${user.user.discriminator} (${user.user.id})\n**Action:** Unmute\n**Reason:** ${reason}`)
      channel.send(mlE)
    }
  }
}

module.exports = UnmuteCommand