import db from 'quick.db'
import Command from '../models/Command'
const config = new db.table('config')

class Prefix extends Command {
  constructor (client) {
    super(client, {
      name: 'prefix',
      description: 'Change the bot\'s prefix.',
      aliases: ['pre', 'p'],
      category: 'Config',
      usage: 'prefix [new prefix]',
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    if (!msg.member.hasPermission('ADMINISTRATOR') && !msg.member.hasPermission('MANAGE_GUILD')) {
      return msg.channel.send('You are missing the permission `Administrator` or `Manage Server`.')
    }
    if (!args[0]) {
      return msg.channel.send('I require a valid prefix.')
    }
    config.set(`${msg.guild.id}.prefix`, args[0])
    msg.channel.send(`The prefix has been changed to \`${args[0]}\`.`)
  }
}

module.exports = Prefix
