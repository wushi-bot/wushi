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
      category: 'Income',
      aliases: ['bitmine', 'minecoin'],
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    if (!eco.get(`${msg.author.id}.started`)) {
      const embed = new discord.MessageEmbed()
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setColor('#f20f0f')
        .setDescription(`:x: You have no account setup! Set one up using \`${utils.getPrefix(msg.guild.id)}start\`.`)
      return msg.channel.send(embed)
    }
    if (!eco.get(`${msg.author.id}.items`).includes('Laptop')) {
      const embed = new discord.MessageEmbed()
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setColor('#f20f0f')
        .setDescription(':x: You need to buy a laptop in the store to use this command!')
      return msg.channel.send(embed)
    }
    const money = utils.getRandomInt(20000, 45000)
    const usage = utils.getRandomInt(1, 3)
    const earnings = utils.addMoney(money, msg.author.id)
    eco.add(`${msg.author.id}.laptop_profit`, earnings)
    if (eco.get(`${msg.author.id}.effects`)) {
      if (!eco.get(`${msg.author.id}.effects`).includes('hardening')) {
        eco.add(`${msg.author.id}.laptop_durability`, usage)
      }
    } else {
      eco.add(`${msg.author.id}.laptop_durability`, usage)
    }
    const embed = new discord.MessageEmbed()
      .setColor('#0099ff')
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
