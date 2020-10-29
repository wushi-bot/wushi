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
    const user = msg.guild.members.cache.get(args[0]) || msg.mentions.members.first() || msg.member
    if (user.user.bot) return msg.channel.send('You cannot see the rank of bots, because they cannot gain EXP.')
    const avatarURL = user.user.avatarURL({ format: 'png' })
    const avatar = await req(avatarURL).raw()
    const bg = await req('https://media.discordapp.net/attachments/744637502413078622/769618814597333012/discord-background.jpg?width=1100&height=619').raw()
    let level = leveling.get(`${user.user.id}.${msg.guild.id}.level`)
    if (!level) {
      level = 0
    }
    let nextLevel = leveling.get(`${user.user.id}.${msg.guild.id}.expNeeded`)
    if (!nextLevel) {
      nextLevel = 100
    }
    let points = leveling.get(`${user.user.id}.${msg.guild.id}.exp`)
    if (!points) {
      points = 0
    }
    const progBar = Math.floor(Math.max((points / nextLevel) * 450, 10))
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
      .addText(user.user.username, 300, 228)
      .setTextFont('35pt Default')
      .addText('#' + user.user.discriminator, 300, 270)
      .setTextAlign('left')
      .setTextFont('25pt Default Bold')
      .addText(`Level ${level}`, 85, 316)
      .addText(`${points} / ${nextLevel}`, 390, 316)
      .addBeveledRect(85, 336, 450, 24, 32)
      .restore()
      .setColor('#ff3f38')
      .addBeveledRect(96, 340, progBar, 16, 20)
      .restore()
    return msg.channel.send({ files: [{ attachment: canvas.toBuffer(), name: 'profile.png' }] })
  }
}

module.exports = RankCommand
