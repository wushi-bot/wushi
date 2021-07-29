import Command from '../../classes/Command'
import { Canvas } from 'canvas-constructor'
import req from '@aero/centra'
import Member from '../../models/Member'
import User from '../../models/User'

class RankCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'rank',
      description: 'See your rank.',
      aliases: ['level', 'r'],
      category: 'Leveling',
      usage: 'rank [@user]',
      cooldown: 15
    })
  }

  async run (bot, msg, args) {
    const user = msg.guild.members.cache.get(args[0]) || msg.mentions.members.first() || msg.member
    if (user.user.bot) {
      this.client.emit('customError', 'You cannot see the rank of bots, because they cannot gain EXP.', msg)
      return false
    }
    const avatarURL = user.user.avatarURL({ format: 'png' })
    const avatar = await req(avatarURL).raw()
    let member = await Member.findOne({
      userId: user.user.id,
      guildId: msg.guild.id
    }).exec()
    if (!member) {
      this.client.emit('customError', 'This user has not gained EXP.', msg)
      return false
    }
    let userSettings = await User.findOne({
      id: msg.author.id
    })
    let level = member.level || 0
    let nextLevel = member.expNeeded || 100
    let points = member.exp || 0
    const progBar = Math.floor(Math.max((points / nextLevel) * 450, 10))
    let rankCardColor = userSettings.rankCardColor || '#ff3f38'
    const canvas = new Canvas(600, 300)
    const bg = await req('https://cdn.discordapp.com/attachments/777628711256064030/828002823185629264/a9620396df0e63802087054fbffabe931ab4de15.png').raw()
    canvas
      .addImage(bg, 0, 0, 600, 300)
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
      .setStroke('#fff')
      .setTextFont('25pt Default Bold')
      .addText(`Level ${level}`, 85, 216)
      .addText(`${points} / ${nextLevel}`, 390, 216)
      .addBeveledRect(85, 230, 450, 24, 32)
      .restore()
      .setColor(rankCardColor)
      .addBeveledRect(91, 234, progBar, 16, 20)
      .resetShadows()
      //.setLineCap('round')
      //.setLineWidth(5)
      //.beginPath()
      //.moveTo(30, 165)
      //.lineTo(570, 165)
      //.stroke()
      //.closePath()
      .clip()
    msg.channel.send({ files: [{ attachment: canvas.toBuffer(), name: 'card.png' }] })
    return true
  }
}

module.exports = RankCommand