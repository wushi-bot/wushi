const discord = require('discord.js')
const db = require('quick.db')
const config = new db.table('config')
const main = require('../bot')

module.exports.run = async (bot, msg, args) => {
  const embed = new discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(`:tools: ${msg.guild.name}'s Configuration`)
    .setDescription('This is the server\'s configuration.')
    .addField(':scroll: Prefix', `This is the prefix for your server, all commands must start with this character(s).\`\`\`${main.getPrefix(msg.guild.id)}\`\`\``)

  if (config.get(`${msg.guild.id}.disabled`) === undefined || config.get(`${msg.guild.id}.disabled`).length === 0) {
    embed.addField(':newspaper: Disabled Modules', `These modules will not show up on \`${main.getPrefix(msg.guild.id)}help\` & will not function. (Enable them using \`${main.getPrefix(msg.guild.id)}toggle <module>\`) \`\`\`None\`\`\``)
  } else {
    embed.addField(':newspaper: Disabled Modules', `These modules will not show up on \`${main.getPrefix(msg.guild.id)}help\` & will not function. (Enable them using \`${main.getPrefix(msg.guild.id)}toggle <module>\`) \`\`\`${config.get(`${msg.guild.id}.disabled`).join(', ')}\`\`\``)
  }
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
