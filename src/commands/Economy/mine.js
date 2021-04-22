import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js'
import utils from '../../utils/utils'
import db from 'quick.db'

const eco = new db.table('economy')

class MineCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'mine',
      description: 'Mine for coins!',
      category: 'Economy',
      aliases: ['pickaxe'],
      usage: 'mine',
      cooldown: 10
    })
  }

  async run (bot, msg, args) {

  }
}

module.exports = MineCommand