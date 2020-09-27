const discord = require('discord.js')
const db = require('quick.db')
const level = new db.table('level')
const eco = new db.table('economy')
const date = require('date-and-time')

module.exports.run = async (bot, msg, args) => {
  const user = msg.mentions.members.first() || msg.guild.members.cache.get(args[0]) || msg.member
  let balance = eco.get(`${user.user.id}.balance`)
  if (!eco.get(`${user.user.id}.balance`)) {
    balance = 0
  }
  let lvl = level.get(`${user.user.id}.${msg.guild.id}.level`)
  let exp = level.get(`${user.user.id}.${msg.guild.id}.exp`)
  let expNeeded = level.get(`${user.user.id}.${msg.guild.id}.expNeeded`) 
  if (!level.get(`${user.user.id}.level`)) {
    lvl = 0
  }  
  if (!level.get(`${user.user.id}.exp`)) {
    exp = 0
  } 
  if (!level.get(`${user.user.id}.exp`)) {
    expNeeded = 0
  }
  if (expNeeded === 0 && exp === 0 && lvl === 0) {
    leveling = false
  } else {
    if (!level.get(`${user.user.id}.${msg.guild.id}.enabled`)) {
      leveling = false
    } else {
      leveling = true
    }
  }
  let obj = Date.parse(`${user.joinedAt}`)
  console.log(user.joinedAt)
  let timeJoined = date.format('MMM D, YYYY', obj)
  const e = new discord.MessageEmbed()
    .setAuthor(`${user.user.username} (${user.user.id})`, user.user.displayAvatarURL())
    .setColor(user.roles.highest.color)
    .addField(' • Guild Statistics', `${timeJoined}`)
    .setFooter(`Requested by ${msg.author.username}`)
    .setTimestamp(Date.now())
  if (leveling) {
    e.addField(' • Bot Statistics', `**:moneybag: Economy** $${balance}\n**:magic_wand: Level** ${lvl} (${exp}/${expNeeded})`)
  } else {
    e.addField(' • Bot Statistics', `**:moneybag: Economy** $${balance}\n**:magic_wand: Level** This person has not gained any EXP or EXP is disabled.`)
  } 
  msg.channel.send(e)
}

module.exports.help = {
  name: 'info',
  description: 'Get information about a specific user.',
  category: 'Util',
  aliases: ['i', 'information', 'user', 'whois'],
  usage: 'i [user]',
  cooldown: 1
}