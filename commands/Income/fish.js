import discord from 'discord.js'
import db from 'quick.db'
import utils from '../../utils/utils'
import Command from '../../models/Command'
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
      cooldown: 30
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
    if (!eco.get(`${msg.author.id}.items`).includes('fishing_rod')) {
      const embed = new discord.MessageEmbed()
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setColor('#f20f0f')
        .setDescription(`You need a fishing rod to fish, obviously. | Buy one on the store using \`${utils.getPrefix(msg.guild.id)}buy fishing_rod\``)
      msg.channel.send(embed)
      return
    }
    const stuff = generateRandomDrop()
    if (eco.get(`${msg.author.id}.items`).includes('fishing_bait')) {
      var multiplies = 0
      eco.get(`${msg.author.id}.items`).forEach(item => {
        if (item === 'fishing_bait') {
          if (multiplies < 6) {
            var temp = stuff[1]
            stuff[1] = Math.floor(temp + (temp * 0.25))
          }
          multiplies++
        }
      })
    }
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
      .setDescription(':fishing_pole_and_fish: You\'ve started **fishing**...')
    msg.channel.send(embed).then(m => {
      embed
        .addField('New Balance', `:coin: **${utils.addCommas(eco.get(`${msg.author.id}.balance`))}**`, true)
        .addField('Durability', `${100 - eco.get(`${msg.author.id}.fishing_rod_durability`)}/100`, true)
        .setDescription(`:fishing_pole_and_fish: You've **fished** up a **${stuff[0]}**, You've earned :coin: **+${earnings}**!`)
        .setTimestamp()
      setTimeout(() => {
        m.edit(embed)
      }, 1500)
    })
    if (eco.get(`${msg.author.id}.fishing_rod_durability`) === 100 || eco.get(`${msg.author.id}.fishing_rod_durability`) > 100) {
      let i = utils.removeA(eco.get(`${msg.author.id}.items`), 'fishing_rod')
      if (eco.get(`${msg.author.id}.items`).includes('fishing_bait')) {
        i = utils.removeA(eco.get(`${msg.author.id}.items`), 'fishing_bait')
      }
      eco.set(`${msg.author.id}.items`, i)
      const embed = new discord.MessageEmbed()
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setTitle(':fishing_pole_and_fish: Uh oh, your **fishing rod** broke!')
        .setColor('#ff2803')
      msg.channel.send(embed)
      eco.set(`${msg.author.id}.fishing_rod_durability`, 0)
    }
  }
}

module.exports = Fish
