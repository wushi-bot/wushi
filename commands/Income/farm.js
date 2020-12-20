import discord from 'discord.js'
import db from 'quick.db'
import utils from '../../utils/utils'
import Command from '../../models/Command'
const eco = new db.table('economy')

var lootTables = ['tomato', 'carrot', 'apple', 'strawberry', 'melon', 'potato', 'corn', 'grapes', 'cherries', 'mangos']

function generateRandomDrop () {
  var lootTable = lootTables[Math.floor(Math.random() * lootTables.length)]
  let display, loot
  switch (lootTable) {
    case 'tomato':
      display = ':tomato: Tomatoes'
      loot = 200
      break
    case 'carrot':
      display = ':carrot: Carrots'
      loot = 275
      break
    case 'apple':
      display = ':apple: Apples'
      loot = 295
      break
    case 'strawberry':
      display = ':strawberry: Strawberries'
      loot = 300
      break
    case 'melon':
      display = ':melon: Melons'
      loot = 225
      break
    case 'potato':
      display = ':potato: Potatoes'
      loot = 250
      break
    case 'corn':
      display = ':corn: Corn'
      loot = 315
      break
    case 'grapes':
      display = ':grapes: Grapes'
      loot = 335
      break
    case 'cherries':
      display = ':cherries: Cherries'
      loot = 300
      break
    case 'mangos':
      display = ':mango: Mangos'
      loot = 305
      break
    default:
      return
  }
  return [display, loot]
}

class Farm extends Command {
  constructor (client) {
    super(client, {
      name: 'farm',
      description: 'Farm for coins!',
      category: 'Income',
      aliases: [],
      usage: 'farm',
      cooldown: 120
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
    if (!eco.get(`${msg.author.id}.items`).includes('farm')) {
      const embed = new discord.MessageEmbed()
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setColor('#f20f0f')
        .setDescription(`You need a farm to farm, obviously. | Buy one on the store using \`${utils.getPrefix(msg.guild.id)}buy farm\``)
      msg.channel.send(embed)
      return
    }
    const stuff = generateRandomDrop()
    if (!eco.get(`${msg.author.id}.effects`).includes('hardening')) {
      eco.add(`${msg.author.id}.farm_uses`, 1)
    }
    if (eco.get(`${msg.author.id}.items`).includes('farm_land')) {
      var multiplies = 0
      eco.get(`${msg.author.id}.items`).forEach(item => {
        if (item === 'farm_land') {
          if (multiplies < 6) {
            var temp = stuff[1]
            stuff[1] = Math.floor(temp + (temp * 0.25))
          }
          multiplies++
        }
      })
    }
    const earnings = stuff[1]
    const out = utils.addMoney(earnings, msg.author.id)
    eco.add(`${msg.author.id}.farming_profit`, earnings)
    const embed = new discord.MessageEmbed()
      .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
      .setColor('#0099ff')
      .setDescription(':seedling: You\'ve started **farming**...')
    msg.channel.send(embed).then(m => {
      embed
        .setFooter(`Your farm durability is at ${150 - eco.get(`${msg.author.id}.pickaxe_durability`)}/150`)
        .setDescription(`:seedling: You've **farmed** some **${stuff[0]}**!\n───────────────────────\n• You've earned :coin: **+${out}**!\n• Your new balance is :coin: **${utils.addCommas(eco.get(`${msg.author.id}.balance`))}**.`)
        .setTimestamp()
      setTimeout(() => {
        m.edit(embed)
      }, 1500)
    })
    if (eco.get(`${msg.author.id}.farm_uses`) > 150 || eco.get(`${msg.author.id}.farm_uses`) === 150) {
      const i = utils.removeA(eco.get(`${msg.author.id}.items`), 'Farm')
      eco.set(`${msg.author.id}.items`, i)
      const embed = new discord.MessageEmbed()
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setDescription(':seedling: You\'ve **used up** all of your farm!')
        .setColor('#ff2d08')
      msg.channel.send(embed)
      return eco.set(`${msg.author.id}.farm_uses`, 0)
    }
  }
}

module.exports = Farm
