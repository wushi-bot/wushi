const discord = require('discord.js')
const db = require('quick.db')
const config = new db.table('config')
const main = require('../bot')

module.exports.run = async (bot, msg, args) => {
  const embed = new discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(`:tools: ${msg.guild.name}'s Configuration`)
    .setDescription('This is the server\'s configuration.')
    .addField('Prefix', `\`\`\`${main.getPrefix(msg.guild.id)}\`\`\``)
  msg.channel.send(embed)
}

module.exports.help = {
  name: 'config',
  description: 'See the config of your server.',
  aliases: ['configuration'],
  category: 'Config',
  usage: 'config',
  cooldown: 1
}
