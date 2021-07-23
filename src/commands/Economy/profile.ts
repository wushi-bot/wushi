import Command from '../../classes/Command'
import { MessageEmbed } from 'discord.js'
import romanizeNumber from 'romanize-number'
import { getPrefix, addCommas, getColor } from '../../utils/utils'

import User from '../../models/User'

class ProfileCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'profile',
      description: 'See you, or another user\'s profile.',
      category: 'Economy',
      aliases: ['pro', 'p'],
      usage: 'profile [@user]',
      cooldown: 3.5
    })
  }

  async run (bot, msg, args) {
    const color = await getColor(bot, msg.member)
    const prefix = await getPrefix(msg.guild.id)
    const member = msg.guild.members.cache.get(args[0]) || msg.mentions.members.first() || msg.member
    const user = await User.findOne({
      id: member.user.id
    }).exec()
    if (!user || !user.started) {
      this.client.emit('customError', `You don't have a bank account! Create one using \`${prefix}start\`.`, msg)
      return false
    }
    const bank = user.bank || 0
    const balance = user.balance || 0
    let prestige = user.prestige || 1
    let multiplier = user.multiplier || 1
    let inventory = Object.keys(user.items).length
    if (prestige === 0) prestige = 1
    if (multiplier === 0) multiplier = 1

    const embed = new MessageEmbed()
      .setAuthor(member.user.tag, member.user.avatarURL())
      .setColor(color)
      .addField(':bank: Banking', `Bank: :coin: **${addCommas(bank)}**\nWallet: :coin: **${addCommas(balance)}**`)
      .addField(':medal: Prestige', `Prestige Level: **${romanizeNumber(prestige)}**`)
      .addField(':crown: Multiplier', `Multiplier: **${multiplier}%**`)
      .addField(':handbag: Inventory', `**${inventory} items** in Inventory`)
    let time = new Date().getTime()
    const d = user.daily || 0
    const w = user.weekly|| 0
    let daily = d >= new Date().getTime()
    let weekly = w >= new Date().getTime()

    if (weekly && daily) embed.addField(':date: Cooldowns', `<:cross:821028198330138644> Daily\n<:cross:821028198330138644> Weekly`)
    else if (!weekly && daily) embed.addField(':date: Cooldowns', `<:cross:821028198330138644> Daily\n<:check:820704989282172960> Weekly`)
    else if (weekly && !daily) embed.addField(':date: Cooldowns', `<:check:820704989282172960> Daily\n<:cross:821028198330138644> Weekly`)
    else if (!weekly && !daily) embed.addField(':date: Cooldowns', `<:check:820704989282172960> Daily\n<:check:820704989282172960> Weekly`)

    if (user.votedDBL && user.votedTop) embed.addField(':up: Voted?', `<:check:820704989282172960> [discordbotlist.com](https://discordbotlist.com/bots/wushi/upvote)\n<:check:820704989282172960> [top.gg](https://top.gg/bot/755526238466080830/vote)`)
    else if (user.votedDBL && !user.votedTop) embed.addField(':up: Voted?', `<:check:820704989282172960> [discordbotlist.com](https://discordbotlist.com/bots/wushi/upvote)\n<:cross:821028198330138644> [top.gg](https://top.gg/bot/755526238466080830/vote)`)
    else if (!user.votedDBL && user.votedTop) embed.addField(':up: Voted?', `<:cross:821028198330138644> [discordbotlist.com](https://discordbotlist.com/bots/wushi/upvote)\n<:check:820704989282172960> [top.gg](https://top.gg/bot/755526238466080830/vote)`)
    else if (!user.votedDBL && !user.votedTop) embed.addField(':up: Voted?', `<:cross:821028198330138644> [discordbotlist.com](https://discordbotlist.com/bots/wushi/upvote)\n<:cross:821028198330138644> [top.gg](https://top.gg/bot/755526238466080830/vote)`)

    msg.reply({ embeds: [embed] })
    return true
  }
}

module.exports = ProfileCommand