import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js'

import db from 'quick.db'
import utils from '../../utils/utils'

const eco = new db.table('economy')

class BuyCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'buy',
      description: 'Purchase something on the store.',
      category: 'Economy',
      aliases: ['purchase'],
      usage: 'buy',
      cooldown: 3.5
    })
  }

  async run (bot, msg, args) {
    const allItems = utils.allItems()
    const item = utils.getItem(allItems, args[0])
    if (!item) {
      return this.client.emit('customError', 'The item you\'ve inserted is not a valid item, please try again or try to retype it.', msg)
    }
    if (!eco.get(`${msg.author.id}.started`)) {
      return this.client.emit('customError', `You have no account setup! Set one up using \`${utils.getPrefix(msg.guild.id)}start\`.`, msg)
    }
    if (eco.get(`${msg.author.id}.balance`) < item.price) {
      return this.client.emit('customError', `${item.emoji} Insufficient coins! | You are :coin: **${utils.addCommas(item.price - eco.get(`${msg.author.id}.balance`))}** off.`, msg)
    }
    if (item.max) {
      var count = {}
      eco.get(`${msg.author.id}.items`).forEach(function (i) { count[i] = (count[i] || 0) + 1 })
      console.log(count[item.id])
      if (count[item.id] >= item.max) {
        return this.client.emit('customError', `${item.emoji} Maximum amount of ${item.emoji} **${item.display}**! | Your inventory has too much ${item.emoji} **${item.display}** to be able to buy more.`, msg)
      }
    }
    eco.subtract(`${msg.author.id}.balance`, item.price)
    eco.push(`${msg.author.id}.items`, item.id)
    const embed = new MessageEmbed()
      .addField(`${item.emoji} Successfully purchased **${item.display}**!`, `Balance: :coin: **${utils.addCommas(Math.floor(eco.get(`${msg.author.id}.balance`)))}** | ${item.description.replace('[PRE]', utils.getPrefix(msg.guild.id))}`)
      .setColor(msg.member.roles.highest.color)
    msg.reply(embed)
  }
}

module.exports = BuyCommand