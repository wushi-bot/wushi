import discord from 'discord.js'
import db from 'quick.db'
import utils from '../utils/utils'
import Command from '../models/Command'
const eco = new db.table('economy')

class Generate extends Command {
  constructor (client) {
    super(client, {
      name: 'generate',
      description: 'Generate coins out of thin air.',
      category: 'Economy',
      aliases: ['gen', 'cometgen'],
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    if (!eco.get(`${msg.author.id}.items`).includes('comet')) {
      const embed = new discord.MessageEmbed()
        .setColor('#ff2803')
        .setTitle(':x: You don\'t have a Comet Generator!')
        .setDescription('You need a comet generator to produce coins, obviously.')
      msg.channel.send(embed)
      return
    }
    var earnings = utils.getRandomInt(750000, 20000000)
    var uses = utils.getRandomInt(5, 51)
    eco.add(`${msg.author.id}.comet_durability`, uses)
    earnings = utils.addMoney(earnings, msg.author.id)
    eco.add(`${msg.author.id}.comet_profit`, earnings)
    const embed = new discord.MessageEmbed()
      .setColor('#77e86b')
      .setTitle(':comet: Excelsior! Generated coins out of thin air.')
      .setDescription(`You got: **+${earnings}** :moneybag: Coins, you are now at **${utils.addCommas(Math.floor(eco.get(`${msg.author.id}.balance`)))}** :moneybag: Coins`)
      .setFooter(`Durability: ${1000 - eco.get(`${msg.author.id}.comet_durability`)}/1000 - If your comet generator reaches 0, it'll break.`)
    msg.channel.send(embed)
    if (eco.get(`${msg.author.id}.comet_durability`) > 1000 || eco.get(`${msg.author.id}.comet_durability`) === 1000) {
      const i = utils.removeA(db.get(`${msg.author.id}.items`), 'comet')
      eco.set(`${msg.author.id}.items`, i)
      const embed = new discord.MessageEmbed()
        .setTitle(':comet: Your comet generator has broken.')
        .setColor('#ff2803')
      msg.channel.send(embed)
      eco.set(`${msg.author.id}.comet_durability`, 0)
    }
  }
}

module.exports = Generate
