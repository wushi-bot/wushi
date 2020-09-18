const discord = require('discord.js')
const xkcd = require('xkcd')

function getRandomInt (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}

module.exports.run = async (bot, msg, args) => {
  args[0]
    ? xkcd(args[0], function (data) {
      const e = new discord.MessageEmbed()
        .setDescription(`[${data.title}](https://xkcd.com/${data.num})`)
        .setColor('#36393f')
        .setImage(data.img)
        .setFooter(`${data.alt}`)
        .setTimestamp()
      msg.channel.send(e)
    })
    : xkcd(function (data) {
      const e = new discord.MessageEmbed()
        .setDescription(`[${data.title}](https://xkcd.com/${data.num})`)
        .setColor('#36393f')
        .setImage(data.img)
        .setFooter(`${data.alt}`)
        .setTimestamp()
      msg.channel.send(e)
    })
}

module.exports.help = {
  name: 'xkcd',
  description: 'Generates a random XKCD comic or a provided one.',
  aliases: ['xckd'],
  category: 'Util',
  usage: 'xkcd [comic id]',
  cooldown: 1
}
