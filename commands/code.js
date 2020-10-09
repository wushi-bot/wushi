const discord = require('discord.js')
const db = require('quick.db')
const eco = new db.table('economy')

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

function getRandomInt (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
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
  if (!eco.get(`${msg.author.id}.items`).includes('Laptop')) {
    const embed = new discord.MessageEmbed()
      .setColor('#ff2d08')
      .setTitle(':x: You don\'t have a laptop!')
      .setDescription('You need a laptop to bitcoin mine, obviously.')
    msg.channel.send(embed)
    return
  }
  const earnings = getRandomInt(20000, 45000)
  const usage = getRandomInt(1, 3)
  eco.add(`${msg.author.id}.balance`, earnings)
  eco.add(`${msg.author.id}.laptop_profit`, earnings)
  eco.add(`${msg.author.id}.laptop_durability`, usage)
  const embed = new discord.MessageEmbed()
    .setColor('#77e86b')
    .setTitle(':computer: It was a good day bitmining.')
    .setDescription(`You got: **+${earnings}** :moneybag: Coins, you are now at **${addCommas(Math.floor(eco.get(`${msg.author.id}.balance`)))}** :moneybag: Coins`)
    .setFooter(`Durability: ${100 - eco.get(`${msg.author.id}.laptop_durability`)}/100 - If your laptop reaches 0, it'll break.`)
  msg.channel.send(embed)
  if (eco.get(`${msg.author.id}.laptop_durability`) > 100 || eco.get(`${msg.author.id}.laptop_durability`) === 100) {
    let i = removeA(eco.get(`${msg.author.id}.items`), 'Laptop')
    eco.set(`${msg.author.id}.items`, i)
    const embed = new discord.MessageEmbed()
      .setTitle(':computer: Uh oh, your laptop broke.')
      .setColor('#ff2803')
    msg.channel.send(embed)
    eco.set(`${msg.author.id}.laptop_durability`, 0)
  }
}
module.exports.help = {
  name: 'code',
  description: 'Bitmine for bitcoin to make some moneys.',
  category: 'Economy',
  aliases: ['bitmine', 'minecoin']
}
