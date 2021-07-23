import Command from '../../classes/Command'
import { MessageEmbed } from 'discord.js'

import User from '../../models/User'
import { allItems, getItem, addCommas, getPrefix, getColor } from '../../utils/utils'
import { checkUser } from '../../utils/database'

class BuyCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'buy',
      description: 'Purchase something on the store.',
      category: 'Economy',
      aliases: ['purchase'],
      usage: 'buy <id>',
      cooldown: 3.5
    })
  }

  async run (bot, msg, args) {
    checkUser(msg.author.id, bot)
    const color = await getColor(bot, msg.member)
    const ai = allItems()
    const prefix = await getPrefix(msg.guild.id)
    const item = getItem(ai, args[0])
    if (!item) {
      this.client.emit('customError', 'The item you\'ve inserted is not a valid item, please try again or try to retype it.', msg)
      return false
    }
    const users = await User.findOne({
      id: msg.author.id
    }).exec()

    if (!user || !user.started) {
      this.client.emit('customError', `You don't have a bank account! Create one using \`${prefix}start\`.`, msg)
      return false
    }
    if (users[0].balance < item.price) {
      this.client.emit('customError', `${item.emoji} Insufficient coins! | You are :coin: **${addCommas(item.price - user.balance)}** off.`, msg)
      return false
    }
    const items = user.items || {}
    if (item.max) {
      if (items[item.id] >= item.max) {
        this.client.emit('customError', `${item.emoji} Maximum amount of ${item.emoji} **${item.display}**! | Your inventory has too much ${item.emoji} **${item.display}** to be able to buy more.`, msg)
        return false
      }
    }
    user.balance -= item.price
    const c = user.items[item.id]|| 0
    user.items[item.id] += 1
    const embed = new MessageEmbed()
      .addField(`${item.emoji} Successfully purchased **${item.display}**!`, `Balance: :coin: **${addCommas(Math.floor(user.balance))}** | ${item.description.replace('[PRE]', prefix)}`)
      .setColor(color)
    msg.reply({ embeds: [embed] })
    return true
  }
}

module.exports = BuyCommand