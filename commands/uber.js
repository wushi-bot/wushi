import discord from 'discord.js'
import db from 'quick.db'
import utils from '../utils/utils'
const eco = new db.table('economy')

function getRandomInt (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
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
  args[0].replace(',', '')
  if (!args[0]) {
    if (!eco.get(`${msg.author.id}.effects`).includes('uber')) {
      const embed = new discord.MessageEmbed()
        .setTitle(':apple: You don\'t have Über.')
        .setDescription(`Consume an ÜberFruit using \`${utils.getPrefix(msg.guild.id)}eat uber\` to start storing coins.`)
        .setColor('#77e86b')
      return msg.channel.send(embed)
    }
    if (!eco.get(`${msg.author.id}.uber`) || eco.get(`${msg.author.id}.uber`) === 0) {
      const embed = new discord.MessageEmbed()
        .setTitle(':apple: You don\'t anything stored in Über.')
        .setDescription(`Store coins using \`${utils.getPrefix(msg.guild.id)}uber <amount>\`.`)
        .setColor('#77e86b')
      return msg.channel.send(embed)
    }
    const embed = new discord.MessageEmbed()
      .setTitle(':apple: ÜberFruit Storage')
      .setDescription(`You have **$${addCommas(eco.get(`${msg.author.id}.uber`))}** coins stored in Über.`)
      .setColor('#77e86b')
    return msg.channel.send(embed)
  }
  if (args[0].isNaN) {
    if (args[0].toString() === 'burst') {
      if (!eco.get(`${msg.author.id}.effects`).includes('uber')) {
        const embed = new discord.MessageEmbed()
          .setTitle(':apple: You don\'t have Über.')
          .setDescription(`Consume an ÜberFruit using \`${utils.getPrefix(msg.guild.id)}eat uber\` to start storing coins.`)
          .setColor('#77e86b')
        return msg.channel.send(embed)
      }
      if (!eco.get(`${msg.author.id}.uber`) || eco.get(`${msg.author.id}.uber`) === 0) {
        const embed = new discord.MessageEmbed()
          .setTitle(':apple: You don\'t anything stored in Über.')
          .setDescription(`Store coins using \`${utils.getPrefix(msg.guild.id)}uber <amount>\`.`)
          .setColor('#77e86b')
        return msg.channel.send(embed)
      }
      var chance = getRandomInt(1, 6)
      let multiplier
      switch (chance) {
        case 1:
          multiplier = 2.25
          break
        case 2:
          multiplier = 2.50
          break
        case 3:
          multiplier = 2
          break
        case 4:
          multiplier = 2.75
          break
        case 5:
          multiplier = 3
          break
        case 6:
          multiplier = 3.25
          break
        default:
          break
      }
      var earnings = (eco.get(`${msg.author.id}.uber`) * multiplier)
      eco.add(`${msg.author.id}.balance`, earnings)
      eco.set(`${msg.author.id}.uber`, 0)
      var i = removeA(eco.get(`${msg.author.id}.effects`), 'uber')
      eco.set(`${msg.author.id}.effects`, i)
      const embed = new discord.MessageEmbed()
        .setTitle(':apple: You\'ve bursted your ÜberFruit.')
        .setDescription(`You've earned $${addCommas(earnings)} from that burst and your multiplier was: x${multiplier}. Eat another ÜberFruit to start storing more coins.`)
        .setColor('#77e86b')
      return msg.channel.send(embed)
    }
  } else {
    if (args[0] > eco.get(`${msg.author.id}.balance`)) {
      const embed = new discord.MessageEmbed()
        .setColor('#ff2d08')
        .setTitle(':x: The amount you\'re trying to give is bigger than your balance')
        .setDescription('Please provide an amount that you actually have.')
      return msg.channel.send(embed)
    }
    eco.add(`${msg.author.id}.uber`, args[0])
    eco.subtract(`${msg.author.id}.balance`, args[0])
    const embed = new discord.MessageEmbed()
      .setTitle(`:apple: Added $${addCommas(args[0])} to ÜberFruit.`)
      .setDescription(`Burst the fruit using \`${utils.getPrefix(msg.guild.id)}uber burst\`.`)
      .setColor('#77e86b')
    return msg.channel.send(embed)
  }
}

module.exports.help = {
  name: 'uber',
  description: 'Store up Uber to burst for a multiplied amount of money.',
  category: 'Economy',
  aliases: ['über'],
  usage: 'uber <amount/burst>',
  cooldown: 1
}
