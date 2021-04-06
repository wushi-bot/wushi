import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js'
import db from 'quick.db'

const cfg = new db.table('config')
const mod = new db.table('moderation')

class UnlockCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'unlock',
      description: 'Unlocks your channel.',
      category: 'Moderation',
      aliases: ['ul'],
      usage: 'unlock',
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
    let reason = args[1] ? args.slice(1).join(' ') : 'No reason specified'
    mod.add(`${msg.guild.id}.cases`, 1)
    try {
      channel.updateOverwrite(msg.guild.roles.everyone, {
        SEND_MESSAGES: null
      })
      const embed = new MessageEmbed()
        .setColor(msg.member.roles.highest.color)
        .addField('<:check:820704989282172960> Success!', `Successfully unlocked <#${channel.id}>. (${reason})`)
      msg.reply(embed)
    } catch (e) {
      return this.client.emit('customError', 'wushi lacks permission to lock channels.', msg)
    }

    if (cfg.get(`${msg.guild.id}.modLog`)) {
      const ch = msg.guild.channels.cache.get(cfg.get(`${msg.guild.id}.modLog`))
      const mlE = new MessageEmbed() 
        .setColor('#5ca5e0')
        .setAuthor(`${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`, msg.author.avatarURL())
        .setDescription(`**Channel:** <#${channel.id}>\n**Action:** Unlock\n**Reason:** ${reason}`)
      ch.send(mlE)
    }
  }
}

module.exports = UnlockCommand