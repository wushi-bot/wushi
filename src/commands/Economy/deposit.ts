import Command from '../../classes/Command'
import { MessageEmbed } from 'discord.js'
import db from 'quick.db'
import { addCommas, getPrefix, abbreviationToNumber } from '../../utils/utils'
const eco = new db.table('economy') 
const cfg = new db.table('config') 

class DepositCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'deposit',
      description: 'Deposit coins to your balance.',
      category: 'Economy',
      aliases: ['dep'],
      usage: 'deposit <amount|half|all>',
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
    if (eco.get(`${msg.author.id}.balance`) === 0) {
      this.client.emit('customError', 'You don\'t have any coins.', msg)
      return false
    }
    let amount 
    if (args[0] === 'all') {
      amount = eco.get(`${msg.author.id}.balance`)
    } else if (args[0] === 'half') {
      amount = eco.get(`${msg.author.id}.balance`) / 2
    } else {
      amount = abbreviationToNumber(args[0])
    }
    if (amount > eco.get(`${msg.author.id}.balance`)) {
      this.client.emit('customError', 'The amount you inserted is more than you have!', msg)
      return false
    }
    if (!amount) {
      if (isNaN(amount)) {
        this.client.emit('customError', 'You need to enter a valid number!', msg)
        return false
      } 
    }
    eco.subtract(`${msg.author.id}.balance`, amount)
    eco.add(`${msg.author.id}.bank`, amount)
    const embed = new MessageEmbed()
      .setColor(color)
      .addField('<:check:820704989282172960> Success!', `Successfully deposited :coin: **${amount}** to your bank.`)
    msg.reply({ embeds: [embed] })
    return true
  }
}

module.exports = DepositCommand