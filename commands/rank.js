import discord from 'discord.js'
import db from 'quick.db'
import utils from '../utils/utils'
import Command from '../models/Command'
import { Canvas } from 'canvas-constructor'
import req from '@aero/centra'
const leveling = new db.table('leveling')

class RankCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'rank',
      description: 'See your rank.',
      aliases: ['level', 'r'],
      category: 'Leveling',
      usage: 'rank [@user]',
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    let user
    const mentionedUser = msg.mentions.users.first()
    if (!mentionedUser) {
      user = msg.author
    } else {
      user = mentionedUser
    }
    if (user.bot) return msg.channel.send('You cannot see the rank of bots, because they cannot gain EXP.')
    const avatarURL = user.avatarURL({ format: 'png' })
    const avatar = await req(avatarURL).raw()
    const bg = await req('https://media.discordapp.net/attachments/744637502413078622/764876206877048852/unknown.png?width=633&height=618').raw()
    let level = leveling.get(`${user.id}.${msg.guild.id}.level`)
    if (!level) {
      level = 0
    }
    let nextLevel = leveling.get(`${user.id}.${msg.guild.id}.expNeeded`)
    if (!nextLevel) {
      nextLevel = 100
    }
    let points = leveling.get(`${user.id}.${msg.guild.id}.exp`)
    if (!points) {
      points = 0
    }
    const progBar = Math.max((points / nextLevel) * 296, 10)
    const canvas = new Canvas(600, 400)
    canvas
      .addTextFont('./resources/fonts/JosefinSans-Regular.ttf', 'Default')
      .addTextFont('./resources/fonts/JosefinSans-Bold.ttf', 'Default Bold')
      .addImage(bg, 0, 0, 600, 400)
      .save()
      .addCircularImage(avatar, 300, 115, 60, true)
      .setTextAlign('center')
      .setColor('#ffff')
      .setTextFont('48pt Default Bold')
      .addText(user.username, 225, 228)
      .setTextFont('35pt Default')
      .addText('#' + user.discriminator, 410, 228)
      .setTextAlign('left')
      .setTextFont('25pt Default Bold')
      .addText(`Level ${level}`, 85, 304)
      .addText(`${points} / ${nextLevel}`, 390, 304)
      .addBeveledRect(85, 320, nextLevel, 24, 28)
      .setColor('#ff3f38')
      .addBeveledRect(96, 324, progBar, 16, 20)
      .restore()
    return msg.channel.send({ files: [{ attachment: canvas.toBuffer(), name: 'profile.png' }] })
  }
}

module.exports = RankCommand
