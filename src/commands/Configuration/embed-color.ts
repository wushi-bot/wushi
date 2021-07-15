import Command from '../../classes/Command'
import col from 'tinycolor2'
import { MessageEmbed } from 'discord.js'
import User from '../../models/User'
import { checkUser } from '../../utils/database'

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
    let users = await User.find({ 
      id: msg.author.id
    }).exec()
    if (users.length > 0) {
      users[0].embedColor = color.toHex()
      await users[0].save()
    } else {
      checkUser(bot, msg.author.id)
      users = await User.find({ 
        id: msg.author.id
      }).exec()
      users[0].embedColor = color.toHex()
      await users[0].save()
    }
    const embed = new MessageEmbed()
      .setColor(color.toHex())
      .addField('<:check:820704989282172960> Success!', `Successfully set your embed color to **#${color.toHex()}**.`)
    msg.reply({ embeds: [embed] })
    return true
  }
}

module.exports = EmbedColorCommand