import Command from '../../structs/command'
import col from 'tinycolor2'
import { MessageEmbed } from 'discord.js-light'
import db from 'quick.db'

const cfg = new db.table('config')
 
class EmbedColorCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'embed-color',
      description: 'Set your default embed color.',
      category: 'Configuration',
      aliases: ['ec'],
      usage: 'embed-color <color>',
      cooldown: 2.5
    })
  }

  async run (bot, msg, args) {
    let color
    if (args[0]) color = col(args[0])
    else color = col.random()
    cfg.set(`${msg.author.id}.color`, color.toHex())
    const embed = new MessageEmbed()
      .setColor(color.toHex())
      .addField('<:check:820704989282172960> Success!', `Successfully set your embed color to **#${color.toHex()}**.`)
    msg.reply(embed)
  }
}

module.exports = EmbedColorCommand