import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js-light'
import color from 'tinycolor2' 
import db from 'quick.db'
const leveling = new db.table('leveling')

class LevelColorCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'level-color',
      description: 'Sets the leveling rank card color.',
      category: 'Leveling',
      aliases: ['lc'],
      usage: 'level-color <color>',
      cooldown: 5
    })
  }

  async run (bot, msg, args) {
    if (!args[0]) {
      this.client.emit('customError', 'You need a valid color.', msg)
      return false
    }
    let col = color(args[0])
    if (!col.isValid()) {
      this.client.emit('customError', 'You need an actual valid color to insert.', msg)
      return false
    }
    leveling.set(`${msg.author.id}.rankCardColor`, col.toHexString())
    const embed = new MessageEmbed()
      .setColor(col.toHexString())
      .addField('<:check:820704989282172960> Success!', `Successfully set the rank card color to **${col.toHexString()}**.`)
    msg.reply(embed)
    return true
  }
}

module.exports = LevelColorCommand