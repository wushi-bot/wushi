import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js'
 
import utils from '../../utils/utils'
import db from 'quick.db'
const eco = new db.table('economy')

class SellCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'sell',
      description: 'Allows you to sell your sack.',
      category: 'Economy',
      aliases: [],
      usage: 'sell',
      cooldown: 3.5
    })
  }

  async run (bot, msg, args) {
    if (!eco.get(`${msg.author.id}.started`)) {
      return this.client.emit('customError', 'You don\'t have a bank account in the server!', msg)
    }
    const sack = eco.get(`${msg.author.id}.sack`) || []
    if (sack.length === 0) {
      return this.client.emit('customError', 'You have nothing in your sack.', msg)
    }
    const l = []
    const l2 = []
    const alreadySeen = []
    const allItems = utils.allItems()
    var count = {}
    sack.forEach(function (i) { count[i] = (count[i] || 0) + 1 })
    sack.forEach(item => {
      const i = utils.getItem(allItems, item.toLowerCase())
      if (i) {
        l2.push(i.sell_price)
        let n = utils.removeA(eco.get(`${msg.author.id}.sack`), i.id)
        eco.set(`${msg.author.id}.sack`, n)
        if (count[item] > 1) {
          if (!alreadySeen.includes(item)) {
            l.push(`${i.emoji} ${i.display} **x${count[item]}**`)
            alreadySeen.push(item)
          }
        } else {
          l.push(`${i.emoji} ${i.display}`)
        }
      }
    })
    let finalProfit = 0
    l2.forEach(earning => {
      finalProfit = finalProfit + earning
      eco.add(`${msg.author.id}.balance`, earning)
    })
    const embed = new MessageEmbed()
      .setColor(msg.member.roles.highest.color)
      .addField('<:check:820704989282172960> Success!', `Successfully sold ${l.join(', ')} and made :coin: **${utils.addCommas(finalProfit)}**.`)
    msg.reply(embed)
  }
}

module.exports = SellCommand