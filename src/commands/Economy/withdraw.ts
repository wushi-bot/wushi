import Command from '../../classes/Command'
import { MessageEmbed } from 'discord.js'
import { abbreviationToNumber, getColor, getPrefix } from '../../utils/utils'

import User from '../../models/User'

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
    const color = await getColor(bot, msg.member)
    const prefix = await getPrefix(msg.guild.id)
    const user = await User.findOne({
      id: msg.author.id
    }).exec()
    if (!user || !user.started) {
      this.client.emit('customError', `You don't have a bank account! Create one using \`${prefix}start\`.`, msg)
      return false
    }
    if (!args[0]) {
      this.client.emit('customError', 'You need to enter a valid number!', msg)
      return false
    }
    if (user.bank === 0) {
      this.client.emit('customError', 'You don\'t have any coins.', msg)
      return false
    }
    
    let amount 
    if (args[0] === 'all') {
      amount = user.bank
    } else if (args[0] === 'half') {
      amount = user.bank / 2
    } else {
      amount = abbreviationToNumber(args[0])
    }
    if (amount > user.bank) {
      return this.client.emit('customError', 'The amount you inserted is more than you have!', msg)
    }
    if (!amount) {
      if (isNaN(amount)) {
        return this.client.emit('customError', 'You need to enter a valid number!', msg)
      } 
    }
    user.bank -= amount
    user.balance += amount
    user.save()
    const embed = new MessageEmbed()
      .setColor(color)
      .addField('<:check:820704989282172960> Success!', `Successfully withdrew :coin: **${amount}** to your balance.`)
    msg.reply({ embeds: [embed] })
    return true
  }
}

module.exports = WithdrawCommand