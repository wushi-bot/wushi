import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js'
import db from 'quick.db'
const cfg = new db.table('config') 

class PurgeCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'purge',
      description: 'Purge a provided amount of messages.',
      category: 'Moderation',
      aliases: ['clear'],
      usage: 'purge',
      cooldown: 3.5
    })
  }

  async run (bot, msg, args) {
    if (!args[0]) {
      return this.client.emit('customError', 'You need to provide arguments.', msg)
    }
    const admins = cfg.get(`${msg.guild.id}.admins`) || []
    const mods = cfg.get(`${msg.guild.id}.mods`) || []
    if (!msg.member.roles.cache.some(role => admins.includes(role.id)) && !msg.member.roles.cache.some(role => mods.includes(role.id)) && !msg.member.permissions.has('ADMINISTRATOR') && !msg.member.permissions.has('MANAGE_MESSAGES')) {
      return this.client.emit('customError', 'You do not have permission to execute this command.', msg)
    }
    if (isNaN(args[0])) return this.client.emit('customError', 'You need a valid number of messages to bulk delete.', msg)
    msg.channel.bulkDelete(parseInt(args[0]) + 1)
  }
}

module.exports = PurgeCommand