import discord from 'discord.js'
import db from 'quick.db'
import utils from '../utils/utils'
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

function addCommas (nStr) {
  nStr += ''
  var x = nStr.split('.')
  var x1 = x[0]
  var x2 = x.length > 1 ? '.' + x[1] : ''
  var rgx = /(\d+)(\d{3})/
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2')
  }
  return x1 + x2
}

function removeA (arr) {
  const a = arguments
  let L = a.length
  let ax
  const what = a[--L]
  if ((ax = arr.indexOf(what)) !== -1) {
    arr.splice(ax, 1)
  }
  return arr
}

module.exports.run = async (bot, msg, args) => {
  if (!eco.get(`${msg.author.id}.started`)) {
    const embed = new discord.MessageEmbed()
      .setTitle('Error!')
      .setColor('#f20f0f')
      .setDescription('You have no account setup! Set one up using `.start`.')
      .setFooter(`Requested by ${msg.author.username}.`, msg.author.avatarURL())
    return msg.channel.send(embed)
  }
  if (!eco.get(`${msg.author.id}.items`).includes('Fishing Rod')) {
    const embed = new discord.MessageEmbed()
      .setColor('#f20f0f')
      .setTitle(':x: You don\'t have a fishing rod!')
      .setDescription('You need a fishing rod to fish, obviously.')
    msg.channel.send(embed)
    return
  }
  const stuff = generateRandomDrop()
  var earnings = utils.addMoney(stuff[1], msg.author.id)
  eco.add(`${msg.author.id}.fishing_profit`, stuff[1])
  if (!eco.get(`${msg.author.id}.fishing_rod_durability`)) eco.set(`${msg.author.id}.fishing_rod_durability`, 0)
  if (!eco.get(`${msg.author.id}.effects`).includes('hardening')) {
    eco.add(`${msg.author.id}.fishing_rod_durability`, 1)
  }
  const embed = new discord.MessageEmbed()
    .setTitle(`:fishing_pole_and_fish: You just fished up a ${stuff[0]}`)
    .setColor('#77e86b')
    .setDescription(`You got: **+${earnings}** :moneybag: Coins, you are now at **${addCommas(Math.floor(eco.get(`${msg.author.id}.balance`)))}** :moneybag: Coins`)
    .setFooter(`Durability: ${100 - eco.get(`${msg.author.id}.fishing_rod_durability`)}/100 - If your fishing rod reaches 0, it breaks.`)
  msg.channel.send(embed)
  if (eco.get(`${msg.author.id}.fishing_rod_durability`) === 100 || eco.get(`${msg.author.id}.fishing_rod_durability`) > 100) {
    const i = removeA(eco.get(`${msg.author.id}.items`), 'Fishing Rod')
    eco.set(`${msg.author.id}.items`, i)
    const embed = new discord.MessageEmbed()
      .setTitle(':fishing_pole_and_fish: Uh oh, your **fishing rod** broke!')
      .setColor('#ff2803')
    msg.channel.send(embed)
    eco.set(`${msg.author.id}.fishing_rod_durability`, 0)
  }
}

module.exports.help = {
  name: 'fish',
  description: 'Fish for some cash!',
  aliases: ['reel'],
  category: 'Economy',
  usage: 'fish',
  cooldown: 1
}
