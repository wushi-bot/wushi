const db = require('quick.db')
const discord = require('discord.js')
const main = require('../bot')
const eco = new db.table('economy')

module.exports.run = async (bot, msg, args) => {
  if (eco.get(`${msg.author.id}.started`)) {
    const embed = new discord.MessageEmbed()
      .setTitle('Error!')
      .setColor('#f20f0f')
      .setDescription('You already have an account!')
    return msg.channel.send(embed)
  } else {
    eco.set(`${msg.author.id}`, { balance: 50, items: ['Fishing Rod'] })
    eco.set(`${msg.author.id}.started`, true)
    const embed = new discord.MessageEmbed()
      .setTitle(':checkered_flag: You have started a bank account!')
      .setColor('#ffa3e5')
      .setDescription('You have received:\n\n+ **50 coins** :money_with_wings:\n+ **1 Fishing Rod** :fishing_pole_and_fish: ')
      .setFooter(`Do ${main.getPrefix(msg.guild.id)}help to get see more commands to do! | You can also fish to get coins via ${main.getPrefix(msg.guild.id)}fish`)
    return msg.channel.send(embed)
  }
}

module.exports.help = {
  name: 'start',
  description: 'Start your bank account!',
  aliases: [],
  category: 'Economy',
  usage: 'start',
  cooldown: 0
}
