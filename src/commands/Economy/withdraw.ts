import Command from '../../classes/Command'
import { MessageEmbed } from 'discord.js'
import db from 'quick.db'
import { abbreviationToNumber } from '../../utils/utils'
const eco = new db.table('economy') 
const cfg = new db.table('config')

class WithdrawCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'withdraw',
      description: 'Withdraw coins from your bank.',
      category: 'Economy',
      aliases: ['with'],
      usage: 'withdraw <amount|half|all>',
      cooldown: 3.5
    })
  }

  async run (bot, msg, args) {
    const color = cfg.get(`${msg.author.id}.color`) || msg.member.roles.highest.color
    if (!eco.get(`${msg.author.id}.started`)) {
      this.client.emit('customError', 'You don\'t have a bank account!', msg)
      return false
    }
    if (!args[0]) {
      this.client.emit('customError', 'You need to enter a valid number!', msg)
      return false
    }
    if (eco.get(`${msg.author.id}.bank`) === 0) {
      this.client.emit('customError', 'You don\'t have any coins.', msg)
      return false
    }
    
    let amount 
    if (args[0] === 'all') {
      amount = eco.get(`${msg.author.id}.bank`)
    } else if (args[0] === 'half') {
      amount = eco.get(`${msg.author.id}.bank`) / 2
    } else {
      amount = abbreviationToNumber(args[0])
    }
    if (amount > eco.get(`${msg.author.id}.bank`)) {
      return this.client.emit('customError', 'The amount you inserted is more than you have!', msg)
    }
    if (!amount) {
      if (isNaN(amount)) {
        return this.client.emit('customError', 'You need to enter a valid number!', msg)
      } 
    }
    eco.subtract(`${msg.author.id}.bank`, amount)
    eco.add(`${msg.author.id}.balance`, amount)
    const embed = new MessageEmbed()
      .setColor(color)
      .addField('<:check:820704989282172960> Success!', `Successfully withdrew :coin: **${amount}** to your balance.`)
    msg.reply({ embeds: [embed] })
    return true
  }
}

module.exports = WithdrawCommand