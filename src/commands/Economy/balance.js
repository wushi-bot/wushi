import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js-light'
import db from 'quick.db'
import utils from '../../utils/utils'
const eco = new db.table('economy') 

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
    const user = msg.guild.members.cache.get(args[0]) || msg.mentions.members.first() || msg.member 
    const bank = eco.get(`${user.user.id}.bank`) || 0
    const wallet = eco.get(`${user.user.id}.balance`) || 0
    const embed = new MessageEmbed()
      .setAuthor(`${user.user.username}'s Balance`, user.user.avatarURL()) 
      .addField(':bank: Bank', `:coin: **${utils.addCommas(bank)}**`)
      .addField(':purse: Wallet', `:coin: **${utils.addCommas(wallet)}**`)
      .addField(':moneybag: Total', `:coin: **${utils.addCommas(wallet + bank)}**`)
      .setColor(msg.member.roles.highest.color)
    msg.reply(embed)
  }
}

module.exports = BalanceCommand