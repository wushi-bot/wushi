import { CommandInteraction } from 'discord.js'

import { addCommas } from '../utils/functions'
import { Canvas, registerFont, resolveImage } from 'canvas-constructor/cairo'
import { getUser } from '../utils/database'
import { emojis } from '../utils/constants'
import Bot from '../models/Client'
import Command from '../models/Command'

class ProfileCommand extends Command {
  constructor() {
    super(
      'profile', 
      'Sends you (or a profile user\'s) economy profile.'
    )
    this.addUserOption(option => 
      option
        .setName('user')
        .setDescription('The user to get.')  
        .setRequired(false)
    )
  }

  async execute(interaction: CommandInteraction, client: Bot) {
    let user = interaction.options.getUser('user') || interaction.member.user
    if (user.bot) {
      return await interaction.reply({ content: `${emojis.error} You cannot see the profile of bots, because they cannot gain coins.`, ephemeral: true })
    }
    // @ts-ignore
    const avatarURL = user.avatarURL({ format: 'png' })
    const bg = await resolveImage('https://cdn.discordapp.com/attachments/777628711256064030/828002823185629264/a9620396df0e63802087054fbffabe931ab4de15.png')
    const avatar = await resolveImage(avatarURL)
    let username = user.username
    let discrim = user.discriminator
    user = await getUser(user.id) 
    const canvas = new Canvas(600, 450)
    let reputation
    let score = 0
    // @ts-ignore
    if (!user.reputation) {
      reputation = 'No reputation yet.'
    } else { // @ts-ignore
      let values = Object.keys(user.reputation)
      for (let vote of values) { // @ts-ignore
        if (user.reputation[vote] === true) {
          score++
        } else {
          score--
        }
      }
      let symbol = score > 0 ? '+' : '' 
      reputation = `${symbol}${score}`
    }
    registerFont('./src/resources/fonts/Inter-ExtraBold.ttf', {
      family: 'Default Bold'
    })
    registerFont('./src/resources/fonts/Inter-Medium.ttf', {
      family: 'Default'
    })
    canvas
      .printImage(bg, 0, 0, 600, 450)
      .setShadowColor('#44474d')
      .setShadowBlur(10)
      .setShadowOffsetY(5)
      .printCircle(80, 90, 48)
      .restore()
      .printCircularImage(avatar, 80, 90, 48)
      .setColor('#ffff')
      .setTextFont('36pt Default')
      .printText(username, 140, 94)
      .setTextFont('18pt Default Bold')
      .setColor('#cfd1d0')
      .printText(`#${discrim}`, 140, 128)
      .setTextFont('24pt Default Bold')
      .setColor('#ffff')
      .printText('Economy', 40, 350)
      .printText('Reputation', 40, 245)
      .setTextFont('18pt Default')
      .setColor('#cfd1d0')
      .printText(`${reputation}`, 40, 280) // @ts-ignore
      .printText(`Balance: ${await addCommas(user.balance)}`, 40, 418) // @ts-ignore
    await interaction.reply({ files: [{ attachment: canvas.toBuffer(), name: 'card.png' }] })
  }
}

module.exports = ProfileCommand