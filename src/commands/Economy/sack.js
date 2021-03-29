
import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js'
 
import utils from '../../utils/utils'
import db from 'quick.db'
const eco = new db.table('economy')


class SackCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'sack',
      description: 'View your sack.',
      category: 'Economy',
      aliases: [],
      usage: 'sack',
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
    const alreadySeen = []
    const allItems = utils.allItems()
    var count = {}
    sack.forEach(function (i) { count[i] = (count[i] || 0) + 1 })
    sack.forEach(item => {
      const i = utils.getItem(allItems, item.toLowerCase())
      if (i) {
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
    const embed = new MessageEmbed()
      .setColor(msg.member.roles.highest.color)
      .addField(':handbag: Sack', `Items in **:handbag: Sack**: ${l.join(', ')}.`)
    msg.reply(embed)
  }
}

module.exports = SackCommand