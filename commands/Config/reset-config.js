import db from 'quick.db'
import Command from '../../models/Command'

const cfg = new db.table('config')

class ResetCFGCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'reset-config',
      description: 'Resets the bot\'s configuration in the current server in case it doesn\'t work in your server.',
      category: 'Config',
      aliases: [],
      usage: 'reset-config',
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    if (!msg.member.hasPermission('ADMINISTRATOR') && !msg.member.hasPermission('MANAGE_GUILD')) {
      return msg.channel.send('You are missing the permission `Administrator` or `Manage Server`.')
    }
    cfg.set(`${msg.guild.id}.setup`, true)
    cfg.set(`${msg.guild.id}.disabled`, ['Leveling'])
    msg.channel.send('The configuration for this server has been reset, the bot should function properly now.')
  }
}

module.exports = ResetCFGCommand
