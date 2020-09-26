const discord = require('discord.js')
const db = require('quick.db')
const config = new db.table('config')
const main = require('../bot')

module.exports.run = async (bot, msg, args) => {
  if (!msg.member.hasPermission('ADMINISTRATOR') && !msg.member.hasPermission('MANAGE_SERVER')) {
    return msg.channel.send('You are missing the permission `Administrator` or `Manage Server`.')
  }
  if (!args[0]) {
    return msg.channel.send('I require a valid prefix.')
  }
  config.set(`${msg.guild.id}.prefix`, args[0])
  msg.channel.send(`The prefix has been changed to \`${args[0]}\`.`)
}

module.exports.help = {
  name: 'prefix',
  description: 'Change the bot\'s prefix.',
  aliases: ['pre'],
  category: 'Config',
  usage: 'prefix [new prefix]',
  cooldown: 1
}