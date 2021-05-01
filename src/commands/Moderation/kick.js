import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js'
import db from 'quick.db'

const cfg = new db.table('config') 
const mod = new db.table('moderation') 

class KickCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'kick',
      description: 'Kicks the provided user from the server.',
      category: 'Moderation',
      aliases: ['k'],
      usage: 'kick <@user> [reason]',
      cooldown: 3.5
    })
  }

  async run (bot, msg, args) {
    if (!args[0]) {
      return this.client.emit('customError', 'You need to provide arguments.', msg)
    }
    const admins = cfg.get(`${msg.guild.id}.admins`) || []
    const mods = cfg.get(`${msg.guild.id}.mods`) || []
    if (!msg.member.roles.cache.some(role => admins.includes(role.id)) && !msg.member.roles.cache.some(role => mods.includes(role.id)) && !msg.member.permissions.has('ADMINISTRATOR') && !msg.member.permissions.has('KICK_MEMBERS')) {
      return this.client.emit('customError', 'You do not have permission to execute this command.', msg)
    }
    const user = msg.guild.members.cache.get(args[0]) || msg.mentions.members.first()
    if (!user) {
      return this.client.emit('customError', 'I couldn\'t find this member.', msg)
    }
    if (user.roles.cache.some(role => admins.includes(role.id)) || user.roles.cache.some(role => mods.includes(role.id)) || user.permissions.has('ADMINISTRATOR')) {
      return this.client.emit('customError', 'This person cannot be kicked as they already have permissions or are an admin/mod.', msg)
    }
    let reason = args[1] ? args.slice(1).join(' ') : 'No reason specified'
    mod.add(`${msg.guild.id}.cases`, 1)
    try {
      await user.kick('Kicking user')
      const embed = new MessageEmbed()
        .setColor(msg.member.roles.highest.color)
        .addField('<:check:820704989282172960> Success!', `Successfully kicked **${user.user.username}#${user.user.discriminator}**. (${reason})`)
      msg.reply(embed)
    } catch (e) {
      return this.client.emit('customError', 'wushi lacks permission to kick people.', msg)
    }
    if (cfg.get(`${msg.guild.id}.modLog`)) {
      const channel = msg.guild.channels.cache.get(cfg.get(`${msg.guild.id}.modLog`))
      const mlE = new MessageEmbed() 
        .setColor('#ff9e1f')
        .setAuthor(`${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`, msg.author.avatarURL())
        .setDescription(`**User:** ${user.user.username}#${user.user.discriminator} (${user.user.id})\n**Action:** Kick\n**Reason:** ${reason}`)
        if (channel) channel.send(mlE)
    }
  }
}

module.exports = KickCommand