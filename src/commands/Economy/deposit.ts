import Command from '../../classes/Command'
import { MessageEmbed } from 'discord.js'
import { addCommas, getPrefix, abbreviationToNumber, getColor } from '../../utils/utils'
import User from '../../models/User'

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
    const color = await getColor(bot, msg.member)
    const user = await User.findOne({
      id: msg.author.id
    }).exec()
    const prefix = await getPrefix(msg.guild.id)
    if (!user || !user.started) {
      this.client.emit('customError', `You don't have a bank account! Create one using \`${prefix}start\`.`, msg)
      return false
    }
    if (!args[0]) {
      this.client.emit('customError', 'You need to enter a valid number!', msg)
      return false
    }
    if (user.balance === 0 || !user.balance) {
      this.client.emit('customError', 'You don\'t have any coins.', msg)
      return false
    }
    let amount 
    if (args[0] === 'all') {
      amount = user.balance
    } else if (args[0] === 'half') {
      amount = user.balance / 2
    } else {
      amount = abbreviationToNumber(args[0])
    }
    if (amount > user.balance) {
      this.client.emit('customError', 'The amount you inserted is more than you have!', msg)
      return false
    }
    if (!amount) {
      if (isNaN(amount)) {
        this.client.emit('customError', 'You need to enter a valid number!', msg)
        return false
      } 
    }
    if (!user.balance = 0) user.balance = 0
    user.balance -= amount
    user.bank += amount
    user.save()
    const embed = new MessageEmbed()
      .setColor(color)
      .addField('<:check:820704989282172960> Success!', `Successfully deposited :coin: **${amount}** to your bank.`)
    msg.reply({ embeds: [embed] })
    return true
  }
}

module.exports = DepositCommand