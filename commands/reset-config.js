import db from 'quick.db'
import Command from '../models/Command'
import { MessageEmbed } from 'discord.js'

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
    cfg.set(`${msg.guild.id}.setup`, true)
    cfg.set(`${msg.guild.id}.disabled`, ['Leveling', 'Server Shop'])
    msg.channel.send('The configuration for this server has been reset, the bot should function properly now.')
  }
}

module.exports = ResetCFGCommand
