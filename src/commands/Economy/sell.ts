import Command from '../../classes/Command'
import { addCommas, allItems, getItem } from '../../utils/utils'
import { MessageEmbed } from 'discord.js'
import db from 'quick.db'

const eco = new db.table('economy') 
const cfg = new db.table('config') 

class SellCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'sell',
      description: 'Sell items in your inventory for cash.',
      category: 'Economy',
      aliases: ['se'],
      usage: 'sell <item> [amount/all/half]',
      cooldown: 3
    })
  }

  async run (bot, msg, args) {
    if (!eco.get(`${msg.author.id}.started`)) return this.client.emit('customError', 'You don\'t have a bank account!', msg)
    const color = cfg.get(`${msg.author.id}.color`) || msg.member.roles.highest.color
    if (!args[0] || !args[1]) {
      this.client.emit('customError', 'Invalid arguments, you need to provide a valid item and the amount you wish to sell.', msg)
      return false
    }
    const item = getItem(allItems(), args[0])
    if (!item) {
      this.client.emit('customError', 'Invalid item, you need to insert a valid item.', msg)
      return false 
    }
    const amount = eco.get(`${msg.author.id}.items.${item.id}`)
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
    eco.add(`${msg.author.id}.balance`, profit)
    eco.subtract(`${msg.author.id}.items.${item.id}`, desiredAmount)
    if (eco.get(`${msg.author.id}.items.${item.id}`) === 0) eco.set(`${msg.author.id}.items.${item.id}`, 0)
    const embed = new MessageEmbed()
      .addField('<:check:820704989282172960> Success!', `Successfully sold ${desiredAmount} **${item.emoji} ${item.display}** and made :coin: **${addCommas(profit)}** as profit.`)
      .setColor(color)
    msg.reply({ embeds: [embed] })
    return true
  }
}

module.exports = SellCommand