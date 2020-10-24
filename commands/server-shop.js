import db from 'quick.db'
import Command from '../models/Command'
import { MessageEmbed } from 'discord.js'

import shop from '../resources/items/server-items.json'
import utils from '../utils/utils'

const cfg = new db.table('config')

class ServerShop extends Command {
  constructor (client) {
    super(client, {
      name: 'server-shop',
      description: 'Brings you the server shop for server-side items.',
      category: 'Server Shop',
      aliases: ['servershop'],
      usage: 'server-shop',
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    const embed = new MessageEmbed()
      .setColor('#77e86b')
      .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
      .setDescription(':sparkles: **Server Shop** | The server shop catalog.')
      .setFooter(`Use ${utils.getPrefix(msg.guild.id)}server-buy <item id> to buy items in the server-shop.`)
    shop.forEach(item => {
      embed.addField(`${item.emoji} ${item.display}`, `ID: \`${item.id}\` | Price: **$${utils.addCommas(item.price)}** | ${item['description'].replace('[PRE]', utils.getPrefix(msg.guild.id))}`)
    })
    msg.channel.send(embed)
  }
}

module.exports = ServerShop
