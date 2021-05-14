import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js-light'
import romanizeNumber from 'romanize-number'
import utils from '../../utils/utils'
import db from 'quick.db'
import ms from 'ms'
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
    if (!eco.get(`${user.user.id}.started`)) return this.client.emit('customError', 'That user does not have a bank account!', msg)
    const bank = eco.get(`${user.user.id}.bank`) || 0
    const balance = eco.get(`${user.user.id}.balance`) || 0
    let prestige = eco.get(`${user.user.id}.prestige`) || 1
    let multiplier = eco.get(`${user.user.id}.multiplier`) || 1
    let luck = eco.get(`${user.user.id}.luck`) || 0
    let inventory = eco.get(`${user.user.id}.items`) || []
    var count = 0
    inventory.forEach(function () { count++ })
    if (prestige === 0) prestige = 1
    if (multiplier === 0) multiplier = 1

    const embed = new MessageEmbed()
      .setAuthor(user.user.tag, user.user.avatarURL())
      .setColor(msg.member.roles.highest.color)
      .addField(':bank: Banking', `Bank: :coin: **${utils.addCommas(bank)}**\nWallet: :coin: **${utils.addCommas(balance)}**`, true)
      .addField(':medal: Prestige', `Prestige Level: **${romanizeNumber(prestige)}**`, true)
      .addField(':crown: Multiplier', `Multiplier: **${multiplier}%**`, true)
      .addField(':four_leaf_clover: Luck', `Luck: **${luck}%**`, true)
      .addField(':handbag: Inventory', `**${count} items** in Inventory`, true)
    let time = new Date().getTime()
    if (!eco.get(`${user.user.id}.daily`)) embed.addField(':date: Daily', `<:check:820704989282172960>`, true)
    else if (eco.get(`${user.user.id}.daily`) >= new Date().getTime()) embed.addField(':date: Daily', `<:cross:821028198330138644> (**${ms(eco.get(`${user.user.id}.daily`) - time, { long: true })}**)`, true)
    else embed.addField(':date: Daily', `<:check:820704989282172960>`, true)

    return msg.reply(embed)
  }
}

module.exports = ProfileCommand