const discord = require('discord.js')
const db = require('quick.db')
const eco = new db.table('economy')
const main = require('../bot')

var lootTables = ['iron', 'silver', 'cobalt', 'lithium', 'bauxite', 'gold']

function generateRandomDrop () {
  var lootTable = lootTables[Math.floor(Math.random() * lootTables.length)]
  let display
  let loot
  switch (lootTable) {
    case 'iron':
      display = 'Iron'
      loot = 75
      break
    case 'silver':
      display = 'Silver'
      loot = 85
      break
    case 'cobalt':
      display = 'Cobalt'
      loot = 100
      break
    case 'lithium':
      display = 'Lithium'
      loot = 99
      break
    case 'bauxite':
      display = 'Bauxite'
      loot = 120
      break
    case 'gold':
      display = 'Gold'
      loot = 150
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
  let what
  let a = arguments
  let L = a.length
  let ax
  what = a[--L]
  if ((ax = arr.indexOf(what)) !== -1) {
    arr.splice(ax, 1)
  }
  return arr
}

module.exports.run = async (bot, msg, args) => {
  if (!eco.get(`${msg.author.id}.items`).includes('Pickaxe')) {
    const embed = new discord.MessageEmbed()
      .setColor('#ff2803')
      .setTitle(':x: You don\'t have a pickaxe!')
      .setDescription('You need a pickaxe to pickaxe, obviously.')
    msg.channel.send(embed)
    return
  }
  const stuff = generateRandomDrop()
  var earnings = main.addMoney(stuff[1], msg.author.id)
  eco.add(`${msg.author.id}.mining_profit`, stuff[1])
  if (!eco.get(`${msg.author.id}.pickaxe_durability`)) eco.set(`${msg.author.id}.pickaxe_durability`, 0)
  if (!eco.get(`${msg.author.id}.effects`).includes('hardening')) {
    eco.add(`${msg.author.id}.pickaxe_durability`, 1)
  }
  const embed = new discord.MessageEmbed()
    .setTitle(`:pick: You just mined up ${stuff[0]}`)
    .setColor('#77e86b')
    .setDescription(`You got: **+${earnings}** :moneybag: Coins, you are now at **${addCommas(Math.floor(eco.get(`${msg.author.id}.balance`)))}** :moneybag: Coins`)
    .setFooter(`Durability: ${75 - eco.get(`${msg.author.id}.pickaxe_durability`)}/75 - If your pickaxe reaches 0, it breaks.`)
  msg.channel.send(embed)
  if (eco.get(`${msg.author.id}.pickaxe_durability`) === 75 || eco.get(`${msg.author.id}.pickaxe_durability`) > 75) {
    const i = removeA(eco.get(`${msg.author.id}.items`), 'Pickaxe')
    eco.set(`${msg.author.id}.items`, i)
    const embed = new discord.MessageEmbed()
      .setTitle(':pick: Uh oh, your **pickaxe** broke!')
      .setColor('#ff2803')
    msg.channel.send(embed)
    eco.set(`${msg.author.id}.pickaxe_durability`, 0)
  }
}

module.exports.help = {
  name: 'mine',
  description: 'Mine ores for cash.',
  category: 'Income',
  aliases: ['dig'],
  usage: 'mine',
  cooldown: 1
}
