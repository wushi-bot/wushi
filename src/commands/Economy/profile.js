import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js-light'
import romanizeNumber from 'romanize-number'
import utils from '../../utils/utils'
import db from 'quick.db'
import ms from 'ms'
const eco = new db.table('economy')
const cfg = new db.table('config')

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
    const color = cfg.get(`${msg.author.id}.color`) || msg.member.roles.highest.color
    const user = msg.guild.members.cache.get(args[0]) || msg.mentions.members.first() || msg.member 
    if (!eco.get(`${user.user.id}.started`)) return this.client.emit('customError', 'That user does not have a bank account!', msg)
    const bank = eco.get(`${user.user.id}.bank`) || 0
    const balance = eco.get(`${user.user.id}.balance`) || 0
    let prestige = eco.get(`${user.user.id}.prestige`) || 1
    let multiplier = eco.get(`${user.user.id}.multiplier`) || 1
    let inventory = Object.keys(eco.get(`${user.user.id}.items`)).length
    if (prestige === 0) prestige = 1
    if (multiplier === 0) multiplier = 1

    const embed = new MessageEmbed()
      .setAuthor(user.user.tag, user.user.avatarURL())
      .setColor(color)
      .addField(':bank: Banking', `Bank: :coin: **${utils.addCommas(bank)}**\nWallet: :coin: **${utils.addCommas(balance)}**`, true)
      .addField(':medal: Prestige', `Prestige Level: **${romanizeNumber(prestige)}**`, true)
      .addField(':crown: Multiplier', `Multiplier: **${multiplier}%**`, true)
      .addField(':handbag: Inventory', `**${inventory} items** in Inventory`, true)
    let time = new Date().getTime()
    const d = eco.get(`${user.user.id}.daily`) || 0
    const w = eco.get(`${user.user.id}.weekly`) || 0
    let daily = d >= new Date().getTime()
    let weekly = w >= new Date().getTime()

    if (weekly && daily) embed.addField(':date: Cooldowns', `<:cross:821028198330138644> Daily\n<:cross:821028198330138644> Weekly`, true)
    else if (!weekly && daily) embed.addField(':date: Cooldowns', `<:cross:821028198330138644> Daily\n<:check:820704989282172960> Weekly`, true)
    else if (weekly && !daily) embed.addField(':date: Cooldowns', `<:check:820704989282172960> Daily\n<:cross:821028198330138644> Weekly`, true)
    else if (!weekly && !daily) embed.addField(':date: Cooldowns', `<:check:820704989282172960> Daily\n<:check:820704989282172960> Weekly`, true)

    if (eco.get(`${msg.author.id}.votedDBL`) && eco.get(`${msg.author.id}.votedTop`)) embed.addField(':up: Voted?', `<:check:820704989282172960> [discordbotlist.com](https://discordbotlist.com/bots/wushi/upvote)\n<:check:820704989282172960> [top.gg](https://top.gg/bot/755526238466080830/vote)`, true)
    else if (eco.get(`${msg.author.id}.votedDBL`) && !eco.get(`${msg.author.id}.votedTop`)) embed.addField(':up: Voted?', `<:check:820704989282172960> [discordbotlist.com](https://discordbotlist.com/bots/wushi/upvote)\n<:cross:821028198330138644> [top.gg](https://top.gg/bot/755526238466080830/vote)`, true)
    else if (!eco.get(`${msg.author.id}.votedDBL`) && eco.get(`${msg.author.id}.votedTop`)) embed.addField(':up: Voted?', `<:cross:821028198330138644> [discordbotlist.com](https://discordbotlist.com/bots/wushi/upvote)\n<:check:820704989282172960> [top.gg](https://top.gg/bot/755526238466080830/vote)`, true)
    else if (!eco.get(`${msg.author.id}.votedDBL`) && !eco.get(`${msg.author.id}.votedTop`)) embed.addField(':up: Voted?', `<:cross:821028198330138644> [discordbotlist.com](https://discordbotlist.com/bots/wushi/upvote)\n<:cross:821028198330138644> [top.gg](https://top.gg/bot/755526238466080830/vote)`, true)

    return msg.reply(embed)
  }
}

module.exports = ProfileCommand