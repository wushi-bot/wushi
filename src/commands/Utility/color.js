import Command from '../../structs/command'
import canvas from 'canvas-constructor'
import color from 'tinycolor2'
import { MessageAttachment, MessageEmbed } from 'discord.js'

// This command contains some snippets from another bot to work, credit goes to https://aero.bot for the idea.

const toTitleCase = str => str.charAt(0).toUpperCase() + str.slice(1)

class ColorCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'color',
      description: 'Grab a color or a random color.',
      category: 'Utility',
      aliases: ['colour'],
      usage: 'color',
      cooldown: 10
    })
  }

  async run (bot, msg, args) {
    let c
    if (args[0]) {
      c = color(args[0])
    } else {
      c = color.random()
    }
    const can = new canvas.Canvas(600, 600)
      .setColor(`#${c.toHex()}`)
      .addRect(0, 0, 600, 600)
      .fill()
      .save()
      .toBuffer()
    const attachment = new MessageAttachment(can, 'color.png')
    const embed = new MessageEmbed()
      .setAuthor(msg.author.tag, msg.author.avatarURL())
      .setDescription([`**${c.toName() ? toTitleCase(c.toName()) : 'Unnamed'}**`,
        `Hex: ${c.toHexString()}`,
        `RGB: ${c.toRgbString()}`,
        `HSV: ${c.toHsvString()}`,
        `HSL: ${c.toHslString()}`].join('\n'))
      .setColor(c.toHex())
      .attachFiles(attachment)
      .setFooter('Credit goes to ravy (https://ravy.pink) from The Aero Team (https://aero.bot)')
      .setImage('attachment://color.png')
    return msg.reply(embed)
  }
}

module.exports = ColorCommand