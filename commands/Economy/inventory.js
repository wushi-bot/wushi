import discord from 'discord.js'
import db from 'quick.db'
import utils from '../../utils/utils'
import Command from '../../models/Command'

import tools from '../../resources/items/tools.json'
import upgrades from '../../resources/items/upgrades.json'
import collectables from '../../resources/items/collectables.json'

const allItems = []
for (const item in tools) {
  allItems.push(tools[item])
}
for (const item in upgrades) {
  allItems.push(upgrades[item])
}
for (const item in collectables) {
  allItems.push(collectables[item])
}

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1)
}

const eco = new db.table('economy')

class Inventory extends Command {
  constructor (client) {
    super(client, {
      name: 'inventory',
      aliases: ['inv'],
      usage: 'inv [user]',
      description: 'Checks a user\'s inventory.',
      category: 'Economy',
      cooldown: 0
    })
  }

  async run (bot, msg, args) {
    const user = msg.guild.members.cache.get(args[0]) || msg.mentions.members.first() || msg.member
    if (!eco.get(`${user.user.id}.items`)) {
      const embed = new discord.MessageEmbed()
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setColor('#0099ff')
        .setTitle(':x: You (or the provided user) has nothing in your inventory.')
      return msg.channel.send(embed)
    }
    const inventory = eco.get(`${user.user.id}.items`)
    const l = []
    const alreadySeen = []
    var count = {}
    eco.get(`${msg.author.id}.items`).forEach(function (i) { count[i] = (count[i] || 0) + 1 })
    inventory.forEach(item => {
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
    const effects = eco.get(`${user.user.id}.effects`)
    const l2 = []
    let displayEffects
    if (effects === undefined || effects.length === 0) {
      displayEffects = 'None'
    } else {
      effects.forEach(effect => {
        l2.push(effect.capitalize())
      })
      displayEffects = l2.join(', ')
    }
    const embed = new discord.MessageEmbed()
      .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
      .setColor('#0099ff')
      .setDescription(`:handbag: **${user.user.username}'s** Inventory | These are the items **${user.user.tag}** has.\n\n**Items:** ${l.join(', ')}\n**Effects:** ${displayEffects}`)
      .setFooter('If an item has x2, x3, x4, that means you have 2, 3, 4 or more of the same item.')
    return msg.channel.send(embed)
  }
}

module.exports = Inventory
