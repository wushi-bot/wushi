import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js-light'
import db from 'quick.db'
import utils from '../../utils/utils'
import romanizeNumber from 'romanize-number'

const eco = new db.table('economy') 
const cfg = new db.table('config') 

class BalanceCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'balance',
      description: 'Gets your bank/purse balance.',
      category: 'Economy',
      aliases: ['bal'],
      usage: 'balance [@user]',
      cooldown: 3.5
    })
  }

  async run (bot, msg, args) {
    if (!eco.get(`${msg.author.id}.started`)) return this.client.emit('customError', 'You don\'t have a bank account!', msg)
    const color = cfg.get(`${msg.author.id}.color`) || msg.member.roles.highest.color
    const user = msg.guild.members.cache.get(args[0]) || msg.mentions.members.first() || msg.member 
    const bank = eco.get(`${user.user.id}.bank`) || 0
    const wallet = eco.get(`${user.user.id}.balance`) || 0
    const prestige = romanizeNumber(eco.get(`${user.user.id}.prestige`) || 1)
    const embed = new MessageEmbed()
      .setAuthor(`${user.user.username}'s Balance`, user.user.avatarURL()) 
      .addField(':bank: Bank', `:coin: **${utils.addCommas(bank)}**`)
      .addField(':purse: Wallet', `:coin: **${utils.addCommas(wallet)}**`)
      .addField(':moneybag: Total', `:coin: **${utils.addCommas(wallet + bank)}**`)
      .setFooter(`Prestige: ${prestige}`)
      .setColor(color)
    msg.reply(embed)
    return true
  }
}

module.exports = BalanceCommand