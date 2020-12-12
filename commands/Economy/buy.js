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

const eco = new db.table('economy')

class Buy extends Command {
  constructor (client) {
    super(client, {
      name: 'buy',
      description: 'Purchase a given item.',
      category: 'Economy',
      aliases: ['purchase'],
      usage: 'buy [item]',
      cooldown: 0
    })
  }

  async run (bot, msg, args) {
    const item = utils.getItem(allItems, args[0])
    if (!item) {
      const embed = new discord.MessageEmbed()
        .setColor('#f20f0f')
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setDescription('The item you\'ve inserted is not a valid item, please try again or try to retype it.')
      return msg.channel.send(embed)
    }
    if (!eco.get(`${msg.author.id}.started`)) {
      const embed = new discord.MessageEmbed()
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setColor('#f20f0f')
        .setDescription(':x: You have no account setup! Set one up using `.start`.')
      return msg.channel.send(embed)
    }
    if (eco.get(`${msg.author.id}.balance`) < item.price) {
      const embed = new discord.MessageEmbed()
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setDescription(`${item.emoji} Insufficient coins! | You are **${utils.addCommas(item.price - eco.get(`${msg.author.id}.balance`))}** :moneybag: Coins off.`)
        .setColor('#ff2803')
      msg.channel.send(embed)
      return
    }
    eco.subtract(`${msg.author.id}.balance`, item.price)
    eco.push(`${msg.author.id}.items`, item.id)
    const embed = new discord.MessageEmbed()
      .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
      .setDescription(`${item.emoji} Purchased **${item.display}**! | Balance: **${utils.addCommas(Math.floor(eco.get(`${msg.author.id}.balance`)))}** :moneybag: Coins | ${item.description.replace('[PRE]', utils.getPrefix(msg.guild.id))}`)
      .setColor('#77e86b')
    msg.channel.send(embed)
  }
}

module.exports = Buy
