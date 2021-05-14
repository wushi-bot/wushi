import { MessageEmbed } from 'discord.js-light'
import Command from '../../structs/command'
import db from 'quick.db'
const cfg = new db.table('config')

class PrefixCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'prefix',
      description: 'Sets the prefix for the bot in your server.',
      aliases: ['p', 'pre'], 
      cooldown: 4.5,
      category: 'Configuration',
      usage: 'prefix <text>'
    })
  }

  async run (bot, msg, args) {
    //TODO: Create admin permissions setup via wushi.
    const admins = cfg.get(`${msg.guild.id}.admins`) || []
    if (!msg.member.roles.cache.some(role => admins.includes(role.id)) && !msg.member.permissions.has('ADMINISTRATOR') && !msg.member.permissions.has('MANAGE_GUILD')) {
      return this.client.emit('customError', 'You do not have permission to execute this command.', msg)
    }
    if (!args[0]) {
      this.client.emit('customError', 'You need to assign a new prefix!', msg)
    } else {
      cfg.set(`${msg.guild.id}.prefix`, args[0])
      const embed = new MessageEmbed()
        .addField('<:check:820704989282172960> Success!', `The prefix for the server has successfully been changed to \`${args[0]}\`.`)
        .setColor(msg.member.roles.highest.color)
      msg.reply(embed)
    }
  }
}

module.exports = PrefixCommand