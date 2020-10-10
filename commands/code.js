import discord from 'discord.js'
import db from 'quick.db'
import utils from '../utils/utils'
import Command from '../models/Command'
const eco = new db.table('economy')

class Code extends Command {
  constructor (client) {
    super(client, {
      name: 'code',
      description: 'Bitmine for bitcoin to make some money.',
      category: 'Economy',
      aliases: ['bitmine', 'minecoin'],
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    if (!eco.get(`${msg.author.id}.items`).includes('Laptop')) {
      const embed = new discord.MessageEmbed()
        .setColor('#ff2d08')
        .setTitle(':x: You don\'t have a laptop!')
        .setDescription('You need a laptop to bitcoin mine, obviously.')
      msg.channel.send(embed)
      return
    }
    const money = utils.getRandomInt(20000, 45000)
    const usage = utils.getRandomInt(1, 3)
    const earnings = utils.addMoney(money, msg.author.id)
    eco.add(`${msg.author.id}.laptop_profit`, earnings)
    eco.add(`${msg.author.id}.laptop_durability`, usage)
    const embed = new discord.MessageEmbed()
      .setColor('#77e86b')
      .setTitle(':computer: It was a good day bitmining.')
      .setDescription(`You got: **+${earnings}** :moneybag: Coins, you are now at **${utils.addCommas(Math.floor(eco.get(`${msg.author.id}.balance`)))}** :moneybag: Coins`)
      .setFooter(`Durability: ${100 - eco.get(`${msg.author.id}.laptop_durability`)}/100 - If your laptop reaches 0, it'll break.`)
    msg.channel.send(embed)
    if (eco.get(`${msg.author.id}.laptop_durability`) > 100 || eco.get(`${msg.author.id}.laptop_durability`) === 100) {
      const i = utils.removeA(eco.get(`${msg.author.id}.items`), 'Laptop')
      eco.set(`${msg.author.id}.items`, i)
      const embed = new discord.MessageEmbed()
        .setTitle(':computer: Uh oh, your laptop broke.')
        .setColor('#ff2803')
      msg.channel.send(embed)
      eco.set(`${msg.author.id}.laptop_durability`, 0)
    }
  }
}

module.exports = Code
