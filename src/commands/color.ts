import { CommandInteraction, MessageEmbed, MessageAttachment } from 'discord.js'
import color from 'tinycolor2'
import { Canvas } from 'canvas-constructor/cairo'

import Bot from '../models/Client'
import Command from '../models/Command'


const toTitleCase = str => str.charAt(0).toUpperCase() + str.slice(1)

class ColorCommand extends Command {
  constructor() {
    super(
      'color', 
      'Displays a random color or the desired color.'
    )
    this.addStringOption(option =>
      option
        .setName('color')
        .setDescription('The color to display')
        .setRequired(false)
    )
  }

  async execute(interaction: CommandInteraction, client: Bot) {
    let c
    if (interaction.options.getString('color')) {
      c = color(interaction.options.getString('color'))
    } else {
      c = color.random()
    }
    const can = new Canvas(600, 600)
      .setColor(`#${c.toHex()}`)
      .printRectangle(0, 0, 600, 600)
      .fill()
      .save()
      .toBuffer()
    const attachment = new MessageAttachment(can, 'color.png')
    const embed = new MessageEmbed()
      .setDescription([`**${c.toName() ? toTitleCase(c.toName()) : 'Unnamed'}**`,
        `Hex: ${c.toHexString()}`,
        `RGB: ${c.toRgbString()}`,
        `HSV: ${c.toHsvString()}`,
        `HSL: ${c.toHslString()}`].join('\n'))
      .setColor(c.toHex())
      .setFooter('Credit goes to ravy (https://ravy.pink) from The Aero Team (https://aero.bot)')
      .setImage('attachment://color.png')
    await interaction.reply({ embeds: [embed], files: [ attachment ] })
  }
}

module.exports = ColorCommand