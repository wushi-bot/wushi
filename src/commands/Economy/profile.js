import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js'
import romanizeNumber from 'romanize-number'
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

    const bank = eco.get(`${user.user.id}.bank`) || 0
    const balance = eco.get(`${user.user.id}.balance`) || 0
    let prestige = eco.get(`${user.user.id}.prestige`) || 1
    let multiplier = eco.get(`${user.user.id}.multiplier`) || 1
    if (prestige === 0) prestige = 1
    if (multiplier === 0) multiplier = 1

    const embed = new MessageEmbed()
      .setAuthor(user.user.tag, user.user.avatarURL())
      .setColor(msg.member.roles.highest.color)
      .addField(':bank: Banking', `Bank: :coin: **${utils.addCommas(bank)}**\nWallet: :coin: **${utils.addCommas(balance)}**`)
      .addField(':medal: Prestige', `Prestige Level: **${romanizeNumber(prestige)}**`)
      .addField(':crown: Multiplier', `Multiplier: **x${multiplier}**`)
      

    return msg.reply(embed)
  }
}

module.exports = ProfileCommand