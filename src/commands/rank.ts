import { CommandInteraction } from 'discord.js'
import { Canvas, registerFont, resolveImage } from 'canvas-constructor/cairo'
import req from '@aero/centra'
import { emojis } from '../utils/constants'

import Bot from '../models/Client'
import Command from '../models/Command'
import { getMember, getUser } from '../utils/database'

class RankCommand extends Command {
  constructor() {
    super(
      'rank', 
      'Gets your (or a provided user\'s) rank on the server'
    )
    this.addUserOption(option => 
      option
        .setName('user')
        .setDescription('The user to get the rank for')
        .setRequired(false)  
    )
  }

  async execute(interaction: CommandInteraction, client: Bot) {
    const user = interaction.options.getUser('user') || interaction.member.user
    if (user.bot) {
      return await interaction.reply({ content: `${emojis.error} You cannot see the rank of bots, because they cannot gain EXP.`, ephemeral: true })
    } // @ts-ignore
    const avatarURL = user.avatarURL({ format: 'png' })
    let member = await getMember(user.id, interaction.guild.id)
    if (!member) {
      return await interaction.reply({ content: `${emojis.error} This user has not gained EXP.`, ephemeral: true })
    }
    let level = member.level || 0
    let nextLevel = member.expNeeded || 100
    let points = member.exp || 0
    const progBar = Math.floor(Math.max((points / nextLevel) * 450, 10))
    let userProfile = await getUser(user.id)
    let rankCardColor = userProfile.rankCardColor || '#ff3f38'
    const canvas = new Canvas(600, 300)
    registerFont('./src/resources/fonts/Inter-ExtraBold.ttf', {
      family: 'Default Bold'
    })
    registerFont('./src/resources/fonts/Inter-Medium.ttf', {
      family: 'Default'
    })
    const bg = await resolveImage('https://cdn.discordapp.com/attachments/777628711256064030/828002823185629264/a9620396df0e63802087054fbffabe931ab4de15.png')
    const avatar = await resolveImage(avatarURL)
    canvas
      .printImage(bg, 0, 0, 600, 300)
      .setShadowColor('#44474d')
      .setShadowBlur(10)
      .setShadowOffsetY(5)
      .printCircle(80, 90, 48)
      .restore()
      .printCircularImage(avatar, 80, 90, 48)
      .setColor('#ffff')
      .setTextFont('36pt Default')
      .printText(user.username, 140, 94)
      .setTextFont('18pt Default Bold')
      .setColor('#cfd1d0')
      .printText(`#${user.discriminator}`, 140, 128)
      .setColor('#ffff')
      .setTextFont('24pt Default Bold')
      .setStroke('#fff')
      .setTextFont('25pt Default Bold')
      .printText(`Level ${level}`, 85, 216)
      .printText(`${points} / ${nextLevel}`, 390, 216)
      .resetShadows()
      .printRoundedRectangle(85, 230, 450, 24, 32)
      .restore()
      .setColor(rankCardColor)
      .printRoundedRectangle(91, 234, progBar, 16, 20)
      .clip()
    await interaction.reply({ files: [{ attachment: canvas.toBuffer(), name: 'card.png' }] })
  }
}

module.exports = RankCommand 