import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js-light'
import db from 'quick.db'
import utils from '../../utils/utils'
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
      return this.client.emit('customError', 'You don\'t have a bank account!', msg)
    }
    if (!args[0]) {
      return this.client.emit('customError', 'You need to enter a valid number!', msg)
    }
    if (eco.get(`${msg.author.id}.balance`) === 0) {
      return this.client.emit('customError', 'You don\'t have any coins.', msg)
    }
    let amount 
    if (args[0] === 'all') {
      amount = eco.get(`${msg.author.id}.balance`)
    } else if (args[0] === 'half') {
      amount = eco.get(`${msg.author.id}.balance`) / 2
    } else {
      amount = utils.abbreviationToNumber(args[0])
    }
    if (amount > eco.get(`${msg.author.id}.balance`)) {
      return this.client.emit('customError', 'The amount you inserted is more than you have!', msg)
    }
    if (!amount) {
      if (isNaN(amount)) {
        return this.client.emit('customError', 'You need to enter a valid number!', msg)
      } 
    }
    eco.subtract(`${msg.author.id}.balance`, amount)
    eco.add(`${msg.author.id}.bank`, amount)
    const embed = new MessageEmbed()
      .setColor(color)
      .addField('<:check:820704989282172960> Success!', `Successfully deposited :coin: **${amount}** to your bank.`)
    msg.reply(embed)
  }
}

module.exports = DepositCommand