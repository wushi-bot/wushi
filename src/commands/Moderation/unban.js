import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js'
import db from 'quick.db'

const cfg = new db.table('config') 
const mod = new db.table('moderation') 

class UnbanCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'unban',
      description: 'Unbans the given user from the server for a provided reason.',
      category: 'Moderation',
      aliases: ['ub'],
      usage: 'unban <id> [reason]',
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
    
    const user = await bot.users.fetch(args[0]) || await bot.users.resolve(args[0]) 
    if (!user) {
      return this.client.emit('customError', 'I couldn\'t find this user.', msg)
    }
    let reason = args[1] ? args.slice(1).join(' ') : 'No reason specified'
    try {
      msg.guild.members.unban(user.id, 'Unbanning user')
    } catch (e) {
      return this.client.emit('customError', 'wushi lacks permission to unban people.', msg)
    }
    mod.add(`${msg.guild.id}.cases`, 1)
    const embed = new MessageEmbed()
      .setColor(msg.member.roles.highest.color)
      .addField('<:check:820704989282172960> Success!', `Successfully unbanned **${user.username}#${user.discriminator}**. (${reason})`)
    msg.reply(embed)
    if (cfg.get(`${msg.guild.id}.modLog`)) {
      const channel = msg.guild.channels.cache.get(cfg.get(`${msg.guild.id}.modLog`))
      const mlE = new MessageEmbed()
        .setColor('#5ca5e0')
        .setAuthor(`${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`, msg.author.avatarURL())
        .setDescription(`**User:** ${user.username}#${user.discriminator} (${user.id})\n**Action:** Unban\n**Reason:** ${reason}`)
      if (channel) channel.send(mlE)
    }
  }
}

module.exports = UnbanCommand