import discord from 'discord.js'
import db from 'quick.db'
import utils from '../utils/utils'
import Command from '../models/Command'
const eco = new db.table('economy')

class Farm extends Command {
  constructor (client) {
    super(client, {
      name: 'farm',
      description: 'Farm for coins!',
      category: 'Economy',
      aliases: [],
      usage: 'farm',
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    if (!eco.get(`${msg.author.id}.items`).includes('Farm')) {
      const embed = new discord.MessageEmbed()
        .setColor('#ff2d08')
        .setTitle(':x: You don\'t have a farm!')
        .setDescription('You need a farm to farm, obviously.')
      msg.channel.send(embed)
      return
    }
    var badDay = utils.getRandomInt(1, 4)
    if (badDay === 1 || badDay === 2) {
      var earnings = utils.getRandomInt(1000, 12000)
      var uses = utils.getRandomInt(1, 8)
      var out = earnings
      if (!eco.get(`${msg.author.id}.effects`).includes('hardening')) {
        eco.add(`${msg.author.id}.farm_uses`, uses)
      }
      out = utils.addMoney(earnings, msg.author.id)
      eco.add(`${msg.author.id}.farming_profit`, earnings)
      const embed = new discord.MessageEmbed()
        .setColor('#0099ff')
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setDescription(`:seedling: It was a good day, earned **+${utils.addCommas(out)}** Coins :moneybag:! | Used up \`${uses}\` uses of the farm! Your farm usage is now at ${150 - eco.get(`${msg.author.id}.farm_uses`)}/150. (Balance: **${utils.addCommas(Math.floor(eco.get(`${msg.author.id}.balance`)))}** Coins :moneybag:)`)
        .setFooter(`Durability: ${150 - eco.get(`${msg.author.id}.farm_uses`)}/150`)
      msg.channel.send(embed)
      if (eco.get(`${msg.author.id}.farm_uses`) > 150 || eco.get(`${msg.author.id}.farm_uses`) === 150) {
        const i = utils.removeA(eco.get(`${msg.author.id}.items`), 'Farm')
        eco.set(`${msg.author.id}.items`, i)
        const embed = new discord.MessageEmbed()
          .setTitle(':seedling: You\'ve used up all of your farm!')
          .setColor('#ff2d08')
        msg.channel.send(embed)
        return eco.set(`${msg.author.id}.farm_uses`, 0)
      }
    } else {
      const earnings = utils.getRandomInt(10, 200)
      eco.subtract(`${msg.author.id}.balance`, earnings)
      eco.subtract(`${msg.author.id}.farming_profit`, earnings)
      const embed = new discord.MessageEmbed()
        .setColor('#ff2d08')
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setDescription(`:man_farmer: It was a bad day, you lost ${earnings} Coins! | Since this was a bad day, you don't use up the farm. However, your farm usage is now at ${150 - eco.get(`${msg.author.id}.farm_uses`)}/150. Balance: ${utils.addCommas(Math.floor(eco.get(`${msg.author.id}.balance`)))} Coins :moneybag:`)
      return msg.channel.send(embed)
    }
  }
}

module.exports = Farm
