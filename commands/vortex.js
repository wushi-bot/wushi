import discord from 'discord.js'
import db from 'quick.db'
import utils from '../utils/utils'
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
  if (!eco.get(`${msg.author.id}.items`).includes('Vortex')) {
    const embed = new discord.MessageEmbed()
      .setColor('#ff2803')
      .setTitle(':x: You don\'t have a vortex!')
      .setDescription('You need a vortex to produce coins, obviously.')
    msg.channel.send(embed)
    return
  }
  var earnings = getRandomInt(750000, 1000000)
  var uses = getRandomInt(5, 10)
  eco.add(`${msg.author.id}.vortex_durability`, uses)
  earnings = utils.addMoney(earnings, msg.author.id)
  eco.add(`${msg.author.id}.vortex_profit`, earnings)
  const embed = new discord.MessageEmbed()
    .setColor('#77e86b')
    .setTitle(':cyclone: The vortex has created an incredible surplus.')
    .setDescription(`You got: **+${earnings}** :moneybag: Coins, you are now at **${addCommas(Math.floor(eco.get(`${msg.author.id}.balance`)))}** :moneybag: Coins`)
    .setFooter(`Durability: ${500 - eco.get(`${msg.author.id}.vortex_durability`)}/500 - If vortex reaches 0, it'll break.`)
  msg.channel.send(embed)
  if (eco.get(`${msg.author.id}.vortex_durability`) > 500 || eco.get(`${msg.author.id}.vortex_durability`) === 500) {
    const i = removeA(eco.get(`${msg.author.id}.items`), 'vortex')
    eco.set(`${msg.author.id}.items`, i)
    const embed = new discord.MessageEmbed()
      .setTitle(':cyclone: Your vortex broke, you can no longer use the vortex, assuming you don\'t have anymore.')
      .setColor('#ff2803')
    msg.channel.send(embed)
    eco.set(`${msg.author.id}.vortex_durability`, 0)
  }
}

module.exports.help = {
  name: 'vortex',
  description: 'Create coins from another planet.',
  category: 'Economy',
  aliases: ['vortexportal', 'portal']
}
