import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js'
import db from 'quick.db'
const eco = new db.table('economy') 

class WithdrawCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'withdraw',
      description: 'Withdraw coins from your bank.',
      category: 'Economy',
      aliases: ['with'],
      usage: 'withdraw <amount | half | all>',
      cooldown: 3.5
    })
  }

  async run (bot, msg, args) {
    if (!eco.get(`${msg.author.id}.started`)) {
      return this.client.emit('customError', 'You don\'t have a bank account in the server!', msg)
    }
    if (!args[0]) {
      return this.client.emit('customError', 'You need to enter a valid number!', msg)
    }
    if (eco.get(`${msg.author.id}.bank`) === 0) {
      return this.client.emit('customError', 'You don\'t have any coins.', msg)
    }
    let amount 
    if (args[0] === 'all') {
      amount = eco.get(`${msg.author.id}.bank`)
    } else if (args[0] === 'half') {
      amount = eco.get(`${msg.author.id}.bank`) / 2
    }
    if (!amount) {
      amount = eco.get(`${msg.author.id}.bank`)
      if (isNaN(amount)) {
        return this.client.emit('customError', 'You need to enter a valid number!', msg)
      } 
      if (amount > eco.get(`${msg.author.id}.bank`)) {
        return this.client.emit('customError', 'The amount you inserted is more than you have!', msg)
      }
    }
    eco.subtract(`${msg.author.id}.bank`, amount)
    eco.add(`${msg.author.id}.balance`, amount)
    const embed = new MessageEmbed()
      .setColor(msg.member.roles.highest.color)
      .addField('<:check:820704989282172960> Success!', `Successfully withdrew :coin: **${amount}** to your balance.`)
    msg.reply(embed)
  }
}

module.exports = WithdrawCommand