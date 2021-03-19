import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js'
import db from 'quick.db'
const eco = new db.table('economy') 

class DepositCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'deposit',
      description: 'Deposit coins to your balance.',
      category: 'Economy',
      aliases: ['dep'],
      usage: 'deposit <amount | half | all>',
      cooldown: 3.5
    })
  }

  async run (bot, msg, args) {
    if (!eco.get(`${msg.guild.id}.${msg.author.id}.started`)) {
      return this.client.emit('customError', 'You don\'t have a bank account in the server!', msg)
    }
    if (!args[0]) {
      return this.client.emit('customError', 'You need to enter a valid number!', msg)
    }
    if (eco.get(`${msg.guild.id}.${msg.author.id}.balance`) === 0) {
      return this.client.emit('customError', 'You don\'t have any coins.', msg)
    }
    let amount 
    if (args[0] === 'all') {
      amount = eco.get(`${msg.guild.id}.${msg.author.id}.balance`)
    } else if (args[0] === 'half') {
      amount = eco.get(`${msg.guild.id}.${msg.author.id}.balance`) / 2
    }
    if (!amount) {
      amount = eco.get(`${msg.guild.id}.${msg.author.id}.balance`)
      if (isNaN(amount)) {
        return this.client.emit('customError', 'You need to enter a valid number!', msg)
      } 
      if (amount > eco.get(`${msg.guild.id}.${msg.author.id}.balance`)) {
        return this.client.emit('customError', 'The amount you inserted is more than you have!', msg)
      }
    }
    eco.subtract(`${msg.guild.id}.${msg.author.id}.balance`, amount)
    eco.add(`${msg.guild.id}.${msg.author.id}.bank`, amount)
    const embed = new MessageEmbed()
      .setColor(msg.member.roles.highest.color)
      .addField('<:check:820704989282172960> Success!', `Successfully deposited :coin: **${amount}** to your bank.`)
    msg.reply(embed)
  }
}

module.exports = DepositCommand