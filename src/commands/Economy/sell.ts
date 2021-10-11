import Command from '../../classes/Command'
import { addCommas, allItems, getItem, getColor, getPrefix } from '../../utils/utils'
import { MessageEmbed } from 'discord.js'

import User from '../../models/User'

class SellCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'sell',
      description: 'Sell items in your inventory for cash.',
      category: 'Economy',
      aliases: ['se'],
      usage: 'sell <item> <amount/all/half>',
      cooldown: 2.5
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
    if (!args[0] || !args[1]) {
      this.client.emit('customError', 'Invalid arguments, you need to provide a valid item and the amount you wish to sell.', msg)
      return false
    }
    const item = getItem(allItems(), args[0])
    if (!item) {
      this.client.emit('customError', 'Invalid item, you need to insert a valid item.', msg)
      return false 
    }
    const amount = user.items[item.id]
    if (!amount) {
      this.client.emit('customError', 'You don\'t have that item.', msg)
      return false 
    }
    let desiredAmount
    if (args[1] === 'all') {
      desiredAmount = amount
    } else if (args[1] === 'half') {
      desiredAmount = Math.floor(amount / 2) 
    } else if (!isNaN(args[1])) {
      desiredAmount = parseInt(args[1])
    }
    if (!desiredAmount) {
      this.client.emit('customError', 'Invalid amount, you need to provide a number, `half`, or `all`.', msg)
      return false
    }
    if (desiredAmount > amount) {
      this.client.emit('customError', 'The amount you provided is more than you actually have.', msg)
      return false
    }
    const profit = Math.floor(desiredAmount * item.sell_price)
    user.balance += profit
    user.items[item.id] -= desiredAmount
    if (user.items[item.id] === 0) delete user.items[item.id]
    const embed = new MessageEmbed()
      .addField('<:check:820704989282172960> Success!', `Successfully sold ${desiredAmount} **${item.emoji} ${item.display}** and made :coin: **${addCommas(profit)}** as profit.`)
      .setColor(color)
    msg.reply({ embeds: [embed] })
    return true
  }
}

module.exports = SellCommand