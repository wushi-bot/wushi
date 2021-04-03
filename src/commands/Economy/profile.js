import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js'
import { Canvas } from 'canvas-constructor'
import req from '@aero/centra'
import utils from '../../utils/utils'
import db from 'quick.db'
const eco = new db.table('economy')

class ProfileCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'profile',
      description: 'See you, or another user\'s profile.',
      category: 'Economy',
      aliases: ['pro'],
      usage: 'profile [@user]',
      cooldown: 3.5
    })
  }

  async run (bot, msg, args) {
    const user = msg.guild.members.cache.get(args[0]) || msg.mentions.members.first() || msg.member 
    const avatarURL = user.user.avatarURL({ format: 'png' })
    const avatar = await req(avatarURL).raw()
    const canvas = new Canvas(600, 400)
    const bg = await req('https://cdn.discordapp.com/attachments/777628711256064030/828002823185629264/a9620396df0e63802087054fbffabe931ab4de15.png').raw()
    const logoImage = await req('https://media.discordapp.net/attachments/777628711256064030/828011253465088040/wushi_graphic-02.png?width=559&height=559').raw()

    const bank = eco.get(`${user.user.id}.bank`) || 0
    const balance = eco.get(`${user.user.id}.balance`) || 0
    canvas
      .addImage(bg, 0, 0, 600, 400)
      .addImage(logoImage, 525, 330, 64, 64)
      .setShadowColor('#44474d')
      .setShadowBlur(10)
      .setShadowOffsetY(5)
      .addCircle(80, 90, 48)
      .restore()
      .addCircularImage(avatar, 80, 90, 48, true)
      .addTextFont('./src/resources/fonts/Inter-ExtraBold.ttf', 'Default Bold')
      .addTextFont('./src/resources/fonts/Inter-Medium.ttf', 'Default')
      .setColor('#ffff')
      .setTextFont('36pt Default')
      .addText(user.user.username, 140, 94)
      .setTextFont('18pt Default Bold')
      .setColor('#cfd1d0')
      .addText(`#${user.user.discriminator}`, 140, 122)
      .setColor('#ffff')
      .setTextFont('24pt Default Bold')
      .addText(`Economy`, 40, 218)
      .setTextFont('24pt Default')
      .addText(`Wallet: ${utils.addCommas(Math.floor(balance))}`, 40, 258)
      .addText(`Bank: ${utils.addCommas(Math.floor(bank))}`, 40, 295)
      .setStroke('#fff')
      .resetShadows()
      .setLineCap('round')
      .setLineWidth(5)
      .beginPath()
      .moveTo(30, 165)
      .lineTo(570, 165)
      .stroke()
      .closePath()
      .clip()
    return msg.channel.send({ files: [{ attachment: canvas.toBuffer(), name: 'profile.png' }] })

  }
}

module.exports = ProfileCommand