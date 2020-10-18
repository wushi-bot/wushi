import discord from 'discord.js'
import db from 'quick.db'
import utils from '../utils/utils'
import Command from '../models/Command'
const eco = new db.table('economy')

class WorkCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'work',
      description: 'Get coins from working in a factory..',
      category: 'Income',
      aliases: ['factory', 'work-factory'],
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    if (!eco.get(`${msg.author.id}.started`)) {
      const embed = new discord.MessageEmbed()
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setColor('#f20f0f')
        .setDescription(':x: You have no account setup! Set one up using `.start`.')
      return msg.channel.send(embed)
    }
    if (!eco.get(`${msg.author.id}.items`).includes('factory')) {
      const embed = new discord.MessageEmbed()
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setColor('#f20f0f')
        .setDescription(`You need a factory to work, obviously. | Buy one on the store using \`${utils.getPrefix(msg.guild.id)}buy factory\``)
      msg.channel.send(embed)
      return
    }
    var earnings = utils.getRandomInt(55000, 175000)
    var uses = utils.getRandomInt(10, 21)
    if (eco.get(`${msg.author.id}.effects`)) {
      if (!eco.get(`${msg.author.id}.effects`).includes('hardening')) {
        eco.add(`${msg.author.id}.factory_durability`, uses)
      }
    } else {
      eco.add(`${msg.author.id}.factory_durability`, uses)
    }
    earnings = utils.addMoney(earnings, msg.author.id)
    eco.add(`${msg.author.id}.factory_profit`, earnings)
    const embed = new discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle(`:factory: Whew! You earned ${utils.addCommas(earnings)}, from working in the factory.`)
      .setDescription(`You got: **+${utils.addCommas(earnings)}** :moneybag: Coins, you are now at **${utils.addCommas(Math.floor(eco.get(`${msg.author.id}.balance`)))}** :moneybag: Coins`)
      .setFooter(`Durability: ${750 - eco.get(`${msg.author.id}.factory_durability`)}/750 - If your comet generator reaches 0, it'll break.`)
    msg.channel.send(embed)
    if (eco.get(`${msg.author.id}.factory_durability`) > 1000 || eco.get(`${msg.author.id}.factory_durability`) === 1000) {
      const i = utils.removeA(eco.get(`${msg.author.id}.items`), 'factory')
      eco.set(`${msg.author.id}.items`, i)
      const embed = new discord.MessageEmbed()
        .setTitle(':factory: Your factory exploded.')
        .setColor('#ff2803')
      msg.channel.send(embed)
      eco.set(`${msg.author.id}.factory_durability`, 0)
    }
  }
}

module.exports = WorkCommand
