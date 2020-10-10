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
  if (!eco.get(`${msg.author.id}.items`).includes('Farm')) {
    const embed = new discord.MessageEmbed()
      .setColor('#ff2d08')
      .setTitle(':x: You don\'t have a farm!')
      .setDescription('You need a farm to farm, obviously.')
    msg.channel.send(embed)
    return
  }
  var badDay = getRandomInt(1, 4)
  if (badDay === 1 || badDay === 2) {
    var earnings = getRandomInt(1000, 12000)
    var uses = getRandomInt(5, 21)
    var out = earnings
    if (!eco.get(`${msg.author.id}.effects`).includes('hardening')) {
      eco.add(`${msg.author.id}.farm_uses`, uses)
    }
    out = utils.addMoney(earnings, msg.author.id)
    eco.add(`${msg.author.id}.farming_profit`, earnings)
    const embed = new discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle(`:seedling: It was a good day, earned **$${addCommas(out)}** :moneybag:!`)
      .setDescription(`Used up **${uses} uses** of the farm! Your farm usage is now at ${150 - eco.get(`${msg.author.id}.farm_uses`)}/150. (**Balance:** $${addCommas(Math.floor(eco.get(`${msg.author.id}.balance`)))} :moneybag:)`)
      .setFooter('Different than the other tools, you use up random amounts of the farm, so it\'s completely random when your farm cannot farm and you need to buy more.')
    msg.channel.send(embed)
    if (eco.get(`${msg.author.id}.farm_uses`) > 150 || eco.get(`${msg.author.id}.farm_uses`) === 150) {
      const i = removeA(eco.get(`${msg.author.id}.items`), 'Farm')
      eco.set(`${msg.author.id}.items`, i)
      const embed = new discord.MessageEmbed()
        .setTitle(':seedling: You\'ve used up all of your farm!')
        .setColor('#ff2803')
      msg.channel.send(embed)
      return eco.set(`${msg.author.id}.farm_uses`, 0)
    }
  } else {
    const earnings = getRandomInt(10, 200)
    eco.subtract(`${msg.author.id}.balance`, earnings)
    eco.subtract(`${msg.author.id}.farming_profit`, earnings)
    const embed = new discord.MessageEmbed()
      .setColor('#ff2d08')
      .setTitle(`:man_farmer: It was a bad day, you lost $${earnings}!`)
      .setDescription(`Since this was a bad day, you don't use up the farm. However, your farm usage is now at ${150 - eco.get(`${msg.author.id}.farm_uses`)}/150. (**Balance:** $${addCommas(Math.floor(eco.get(`${msg.author.id}.balance`)))} :moneybag:)`)
    return msg.channel.send(embed)
  }
}

module.exports.help = {
  name: 'farm',
  description: 'Farm for coins!',
  category: 'Economy',
  aliases: [],
  usage: 'farm',
  cooldown: 1
}
