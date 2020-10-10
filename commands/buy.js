import discord from 'discord.js'
import db from 'quick.db'
import utils from '../utils/utils'
import Command from '../models/Command'
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
    if (args[0] === 'fishingrod') {
      if (eco.get(`${msg.author.id}.balance`) < 100) {
        const embed = new discord.MessageEmbed()
          .setTitle(':fishing_pole_and_fish: Insufficient coins!')
          .setDescription(`You are **${100 - eco.get(`${msg.author.id}.balance`)}** :moneybag: Coins off.`)
          .setColor('#ff2803')
        return msg.channel.send(embed)
      }
      eco.subtract(`${msg.author.id}.balance`, 100)
      eco.push(`${msg.author.id}.items`, 'Fishing Rod')
      const embed = new discord.MessageEmbed()
        .setTitle(':fishing_pole_and_fish: Purchased Fishing Rod!')
        .setDescription(`Balance: **${utils.addCommas(Math.floor(eco.get(`${msg.author.id}.balance`)))}** :moneybag: Coins | You can now fish using \`.fish\`.`)
        .setColor('#77e86b')
      msg.channel.send(embed)
    }
    if (args[0] === 'vortex') {
      if (eco.get(`${msg.author.id}.balance`) < 50000000) {
        const embed = new discord.MessageEmbed()
          .setTitle(':cyclone: Insufficient coins!')
          .setDescription(`You are **${50000000 - eco.get(`${msg.author.id}.balance`)}** :moneybag: Coins off.`)
          .setColor('#ff2803')
        msg.channel.send(embed)
        return
      }
      eco.subtract(`${msg.author.id}.balance`, 50000000)
      eco.push(`${msg.author.id}.items`, 'Vortex')
      const embed = new discord.MessageEmbed()
        .setTitle(':cyclone: Purchased Vortex!')
        .setDescription(`Balance: **${utils.addCommas(Math.floor(eco.get(`${msg.author.id}.balance`)))}** :moneybag: Coins | You can now create coins from another dimension using \`.vortex\`.`)
        .setColor('#77e86b')
      msg.channel.send(embed)
    }
    if (args[0] === 'farm') {
      if (eco.get(`${msg.author.id}.balance`) < 35000) {
        const embed = new discord.MessageEmbed()
          .setTitle(':seedling: Insufficient coins!')
          .setDescription(`You are **${35000 - eco.get(`${msg.author.id}.balance`)}** :moneybag: Coins off.`)
          .setColor('#ff2803')
        msg.channel.send(embed)
        return
      }
      eco.subtract(`${msg.author.id}.balance`, 35000)
      eco.push(`${msg.author.id}.items`, 'Farm')
      const embed = new discord.MessageEmbed()
        .setTitle(':seedling: Purchased Farm!')
        .setDescription(`Balance: **${utils.addCommas(Math.floor(eco.get(`${msg.author.id}.balance`)))}** :moneybag: Coins | You can now farm using \`.farm\`.`)
        .setColor('#77e86b')
      msg.channel.send(embed)
    }
    if (args[0] === 'provato') {
      if (eco.get(`${msg.author.id}.balance`) < 50000) {
        const embed = new discord.MessageEmbed()
          .setTitle(':busts_in_silhouette: Insufficient coins!')
          .setDescription(`You are **${5000 - eco.get(`${msg.author.id}.balance`)}** :moneybag: Coins off.`)
          .setColor('#ff2803')
        msg.channel.send(embed)
        return
      }
      eco.subtract(`${msg.author.id}.balance`, 50000)
      eco.push(`${msg.author.id}.items`, 'Provato')
      const embed = new discord.MessageEmbed()
        .setTitle(':busts_in_silhouette: Purchased Provato!')
        .setDescription(`Balance: **${utils.addCommas(Math.floor(eco.get(`${msg.author.id}.balance`)))}** :moneybag: Coins | You can now double your output using \`.eat provato\`.`)
        .setColor('#77e86b')
      msg.channel.send(embed)
    }
    if (args[0] === 'gummi') {
      if (eco.get(`${msg.author.id}.balance`) < 15000) {
        const embed = new discord.MessageEmbed()
          .setTitle(':lock: Insufficient coins!')
          .setDescription(`You are **${150 - eco.get(`${msg.author.id}.balance`)}** :moneybag: Coins off.`)
          .setColor('#ff2803')
        msg.channel.send(embed)
        return
      }
      eco.subtract(`${msg.author.id}.balance`, 15000)
      eco.push(`${msg.author.id}.items`, 'Gummi')
      const embed = new discord.MessageEmbed()
        .setTitle(':lock: Purchased Gummi!')
        .setDescription(`Balance: **${utils.addCommas(Math.floor(eco.get(`${msg.author.id}.balance`)))}** :moneybag: Coins | You can now stop tool durability loss using \`.eat gummi\`.`)
        .setColor('#77e86b')
      msg.channel.send(embed)
    }
    if (args[0] === 'uber') {
      if (eco.get(`${msg.author.id}.balance`) < 250000) {
        const embed = new discord.MessageEmbed()
          .setTitle(':apple: Insufficient coins!')
          .setDescription(`You are **${150 - eco.get(`${msg.author.id}.balance`)}** :moneybag: Coins off.`)
          .setColor('#ff2803')
        msg.channel.send(embed)
        return
      }
      eco.subtract(`${msg.author.id}.balance`, 250000)
      eco.push(`${msg.author.id}.items`, 'UberFruit')
      const embed = new discord.MessageEmbed()
        .setTitle(':apple: Purchased ÜberFruit!')
        .setDescription(`Balance: **${utils.addCommas(Math.floor(eco.get(`${msg.author.id}.balance`)))}** :moneybag: Coins | You can now get Über using \`.eat uber\`.`)
        .setColor('#77e86b')
      msg.channel.send(embed)
    }
    if (args[0] === 'factory') {
      if (eco.get(`${msg.author.id}.balance`) < 100000) {
        const embed = new discord.MessageEmbed()
          .setTitle(':factory: Insufficient coins!')
          .setDescription(`You are **${100000 - eco.get(`${msg.author.id}.balance`)}** :moneybag: Coins off.`)
          .setColor('#ff2803')
        msg.channel.send(embed)
        return
      }
      eco.subtract(`${msg.author.id}.balance`, 100000)
      eco.push(`${msg.author.id}.items`, 'Factory')
      const embed = new discord.MessageEmbed()
        .setTitle(':factory: Purchased Factory!')
        .setDescription(`Balance: **${utils.addCommas(Math.floor(eco.get(`${msg.author.id}.balance`)))}** :moneybag: Coins | You can now work using \`.work\`.`)
        .setColor('#77e86b')
      msg.channel.send(embed)
    }
    if (args[0] === 'laptop') {
      if (eco.get(`${msg.author.id}.balance`) < 1000000) {
        const embed = new discord.MessageEmbed()
          .setTitle(':computer: Insufficient coins!')
          .setDescription(`You are **${1000000 - eco.get(`${msg.author.id}.balance`)}** :moneybag: Coins off.`)
          .setColor('#ff2803')
        msg.channel.send(embed)
        return
      }
      eco.subtract(`${msg.author.id}.balance`, 1000000)
      eco.push(`${msg.author.id}.items`, 'Laptop')
      const embed = new discord.MessageEmbed()
        .setTitle(':computer: Purchased Laptop!')
        .setDescription(`Balance: **${utils.addCommas(Math.floor(eco.get(`${msg.author.id}.balance`)))}** :moneybag: Coins | You can now bitmine using \`.code\`.`)
        .setColor('#77e86b')
      msg.channel.send(embed)
    }
    if (args[0] === 'pickaxe') {
      if (eco.get(`${msg.author.id}.balance`) < 5000) {
        const embed = new discord.MessageEmbed()
          .setTitle(':pick: Insufficient coins!')
          .setDescription(`You are **${5000 - eco.get(`${msg.author.id}.balance`)}** :moneybag: Coins off.`)
          .setColor('#ff2803')
        msg.channel.send(embed)
        return
      }
      eco.subtract(`${msg.author.id}.balance`, 5000)
      eco.push(`${msg.author.id}.items`, 'Pickaxe')
      const embed = new discord.MessageEmbed()
        .setTitle(':pick: Purchased Pickaxe!')
        .setDescription(`Balance: **${utils.addCommas(Math.floor(eco.get(`${msg.author.id}.balance`)))}** :moneybag: Coins | You can now mine using \`.mine\`.`)
        .setColor('#77e86b')
      msg.channel.send(embed)
    }
  }
}

module.exports = Buy
