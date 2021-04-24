import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js'
import utils from '../../utils/utils'
import db from 'quick.db'

const cfg = new db.table('config')

class ToggleCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'toggle',
      description: 'Toggle a command or module.',
      category: 'Configuration',
      aliases: ['to'],
      usage: 'toggle <module/command>',
      cooldown: 10
    })
  }

  async run (bot, msg, args) {

  }
}

module.exports = ToggleCommand