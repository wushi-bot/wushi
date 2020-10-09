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
  if (!eco.get(`${msg.author.id}.items`).includes('comet')) {
    const embed = new discord.MessageEmbed()
      .setColor('#ff2803')
      .setTitle(':x: You don\'t have a Comet Generator!')
      .setDescription('You need a comet generator to produce coins, obviously.')
    msg.channel.send(embed)
    return
  }
  var earnings = getRandomInt(750000, 20000000)
  var uses = getRandomInt(5, 51)
  eco.add(`${msg.author.id}.comet_durability`, uses)
  eco.add(`${msg.author.id}.balance`, earnings)
  eco.add(`${msg.author.id}.comet_profit`, earnings)
  const embed = new discord.MessageEmbed()
    .setColor('#77e86b')
    .setTitle(':comet: Excelsior! Generated coins out of thin air.')
    .setDescription(`You got: **+${earnings}** :moneybag: Coins, you are now at **${addCommas(Math.floor(eco.get(`${msg.author.id}.balance`)))}** :moneybag: Coins`)
    .setFooter(`Durability: ${1000 - eco.get(`${msg.author.id}.comet_durability`)}/1000 - If your comet generator reaches 0, it'll break.`)
  msg.channel.send(embed)
  if (eco.get(`${msg.author.id}.comet_durability`) > 1000 || eco.get(`${msg.author.id}.comet_durability`) === 1000) {
    let i = removeA(db.get(`${msg.author.id}.items`), 'comet')
    eco.set(`${msg.author.id}.items`, i)
    const embed = new discord.MessageEmbed()
      .setTitle(':comet: Your comet generator has broken.')
      .setColor('#ff2803')
    msg.channel.send(embed)
    eco.set(`${msg.author.id}.comet_durability`, 0)
  }
}

module.exports.help = {
  name: 'generate',
  description: 'Generate coins out of thin air.',
  category: 'Economy',
  aliases: ['gen', 'cometgen']
}
