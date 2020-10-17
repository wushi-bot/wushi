import Command from '../models/Command'
import discord from 'discord.js'
import db from 'quick.db'
import utils from '../utils/utils'
const eco = new db.table('economy')

class Vortex extends Command {
  constructor (client) {
    super(client, {
      name: 'vortex',
      description: 'Create coins from another planet.',
      category: 'Income',
      aliases: ['vortexportal', 'portal'],
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    if (!eco.get(`${msg.author.id}.items`).includes('Vortex')) {
      const embed = new discord.MessageEmbed()
        .setColor('#ff2803')
        .setTitle(':x: You don\'t have a vortex!')
        .setDescription('You need a vortex to produce coins, obviously.')
      msg.channel.send(embed)
      return
    }
    var earnings = utils.getRandomInt(750000, 1000000)
    var uses = utils.getRandomInt(5, 10)
    if (eco.get(`${msg.author.id}.effects`)) {
      if (!eco.get(`${msg.author.id}.effects`).includes('hardening')) {
        eco.add(`${msg.author.id}.vortex_durability`, uses)
      }
    } else {
      eco.add(`${msg.author.id}.vortex_durability`, uses)
    }
    earnings = utils.addMoney(earnings, msg.author.id)
    eco.add(`${msg.author.id}.vortex_profit`, earnings)
    const embed = new discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle(':cyclone: The vortex has created an incredible surplus.')
      .setDescription(`You got: **+${earnings}** :moneybag: Coins, you are now at **${utils.addCommas(Math.floor(eco.get(`${msg.author.id}.balance`)))}** :moneybag: Coins`)
      .setFooter(`Durability: ${500 - eco.get(`${msg.author.id}.vortex_durability`)}/500 - If vortex reaches 0, it'll break.`)
    msg.channel.send(embed)
    if (eco.get(`${msg.author.id}.vortex_durability`) > 500 || eco.get(`${msg.author.id}.vortex_durability`) === 500) {
      const i = utils.removeA(eco.get(`${msg.author.id}.items`), 'vortex')
      eco.set(`${msg.author.id}.items`, i)
      const embed = new discord.MessageEmbed()
        .setTitle(':cyclone: Your vortex broke, you can no longer use the vortex, assuming you don\'t have anymore.')
        .setColor('#ff2803')
      msg.channel.send(embed)
      eco.set(`${msg.author.id}.vortex_durability`, 0)
    }
  }
}

module.exports = Vortex