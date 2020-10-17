import discord from 'discord.js'
import db from 'quick.db'
import utils from '../utils/utils'
import Command from '../models/Command'
const eco = new db.table('economy')

var lootTables = ['cod', 'tuna', 'trout', 'bass', 'mackerel', 'bluefish']

function generateRandomDrop () {
  var lootTable = lootTables[Math.floor(Math.random() * lootTables.length)]
  let display, loot
  switch (lootTable) {
    case 'cod':
      display = 'Cod'
      loot = 10
      break
    case 'tuna':
      display = 'Tuna'
      loot = 5
      break
    case 'trout':
      display = 'Trout'
      loot = 15
      break
    case 'bass':
      display = 'Bass'
      loot = 35
      break
    case 'mackerel':
      display = 'Mackerel'
      loot = 20
      break
    case 'bluefish':
      display = 'Bluefish'
      loot = 35
      break
    default:
      return
  }
  return [display, loot]
}

class Fish extends Command {
  constructor (client) {
    super(client, {
      name: 'fish',
      description: 'Fish for some cash!',
      aliases: ['reel'],
      category: 'Income',
      usage: 'fish',
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
    if (!eco.get(`${msg.author.id}.items`).includes('Fishing Rod')) {
      const embed = new discord.MessageEmbed()
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setColor('#f20f0f')
        .setDescription(`You need a fishing rod to fish, obviously. | Buy one on the store using \`${utils.getPrefix(msg.guild.id)}buy fishingrod\``)
      msg.channel.send(embed)
      return
    }
    const stuff = generateRandomDrop()
    var earnings = utils.addMoney(stuff[1], msg.author.id)
    eco.add(`${msg.author.id}.fishing_profit`, stuff[1])
    if (!eco.get(`${msg.author.id}.fishing_rod_durability`)) eco.set(`${msg.author.id}.fishing_rod_durability`, 0)
    if (eco.get(`${msg.author.id}.effects`)) {
      if (!eco.get(`${msg.author.id}.effects`).includes('hardening')) {
        eco.add(`${msg.author.id}.fishing_rod_durability`, 1)
      }
    } else {
      eco.add(`${msg.author.id}.fishing_rod_durability`, 1)
    }
    const embed = new discord.MessageEmbed()
      .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
      .setColor('#0099ff')
      .setDescription(`:fishing_pole_and_fish: You just fished up a **${stuff[0]}**! | You got: **+${earnings}** :moneybag: Coins, you are now at **${utils.addCommas(Math.floor(eco.get(`${msg.author.id}.balance`)))}** :moneybag: Coins`)
      .setFooter(`Durability: ${100 - eco.get(`${msg.author.id}.fishing_rod_durability`)}/100 - If your fishing rod reaches 0, it breaks.`)
    msg.channel.send(embed)
    if (eco.get(`${msg.author.id}.fishing_rod_durability`) === 100 || eco.get(`${msg.author.id}.fishing_rod_durability`) > 100) {
      const i = utils.removeA(eco.get(`${msg.author.id}.items`), 'Fishing Rod')
      eco.set(`${msg.author.id}.items`, i)
      const embed = new discord.MessageEmbed()
        .setTitle(':fishing_pole_and_fish: Uh oh, your **fishing rod** broke!')
        .setColor('#ff2803')
      msg.channel.send(embed)
      eco.set(`${msg.author.id}.fishing_rod_durability`, 0)
    }
  }
}

module.exports = Fish
