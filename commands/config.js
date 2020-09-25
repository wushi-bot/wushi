const discord = require('discord.js')
const db = require('quick.db')
const config = new db.table('config')

module.exports.run = async (bot, msg, args) => {
  
}

module.exports.help = {
  name: 'config',
  description: 'See the config of your server.',
  aliases: ['configuration'],
  category: 'Config',
  usage: 'config',
  cooldown: 1
}
