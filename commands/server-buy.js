import db from 'quick.db'
import Command from '../models/Command'
import { MessageEmbed } from 'discord.js'
import utils from '../utils/utils'

import items from '../resources/items/server-items.json'

const cfg = new db.table('config')
const eco = new db.table('economy')
const serverEco = new db.table('serverEco')

class ServerBuy extends Command {
  constructor (client) {
    super(client, {
      name: 'server-buy',
      description: 'Buy server only items.',
      category: 'Server Shop',
      aliases: ['s-buy'],
      usage: 'server-buy <item>',
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    const item = utils.getItem(items, args[0])
    if (!item) {
      const embed = new MessageEmbed()
        .setColor('#f20f0f')
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setDescription('The item you\'ve inserted is not a valid item, please try again or try to retype it.')
      return msg.channel.send(embed)
    }
    if (!eco.get(`${msg.author.id}.started`)) {
      const embed = new MessageEmbed()
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setColor('#f20f0f')
        .setDescription(':x: You have no account setup! Set one up using `.start`.')
      return msg.channel.send(embed)
    }
    if (!item.gems) {
      if (eco.get(`${msg.author.id}.balance`) < item.price) {
        const embed = new MessageEmbed()
          .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
          .setDescription(`${item.emoji} Insufficient coins! | You are **${utils.addCommas(item.price - eco.get(`${msg.author.id}.balance`))}** :moneybag: Coins off.`)
          .setColor('#ff2803')
        return msg.channel.send(embed)
      }
    } else {
      if (serverEco.get(`${msg.guild.id}.${msg.author.id}.gems`) < item.price) {
        const embed = new MessageEmbed()
          .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
          .setDescription(`${item.emoji} Insufficient gems! | You are **${utils.addCommas(item.price - serverEco.get(`${msg.guild.id}.${msg.author.id}.gems`))}** :gem: Gems (on this server) off.`)
          .setColor('#ff2803')
        return msg.channel.send(embed)
      }
    }

    if (!item.id === 'gem') {
      serverEco.subtract(`${msg.guild.id}.${msg.author.id}.gems`, item.price)
      serverEco.push(`${msg.guild.id}.${msg.author.id}.items`, item.id)
    } else {
      eco.subtract(`${msg.author.id}.balance`, item.price)
      serverEco.add(`${msg.guild.id}.${msg.guild.author}`)
    }
    const embed = new MessageEmbed()
      .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
      .setColor('#77e86b')
    if (item.gems) {
      embed.setDescription(`${item.emoji} Purchased **${item.display}**! | Balance: **${utils.addCommas(Math.floor(eco.get(`${msg.author.id}.balance`)))}** :gem: Gems | ${item.description.replace('[PRE]', utils.getPrefix(msg.guild.id))}`)
    } else {
      embed.setDescription(`${item.emoji} Purchased **${item.display}**! | Balance: **${utils.addCommas(Math.floor(eco.get(`${msg.author.id}.balance`)))}** :moneybag: Coins | ${item.description.replace('[PRE]', utils.getPrefix(msg.guild.id))}`)
    }
    msg.channel.send(embed)
  }
}

module.exports = ServerBuy
