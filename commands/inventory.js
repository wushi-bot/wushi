import discord from 'discord.js'
import db from 'quick.db'
const eco = new db.table('economy')

module.exports.run = async (bot, msg, args) => {
  let user = msg.mentions.users.first()
  if (!user) {
    user = msg.author
  }
  if (!eco.get(`${user.id}.items`)) {
    const embed = new discord.MessageEmbed()
      .setTitle(':x: You have nothing in your inventory.')
    return msg.channel.send(embed)
  }
  var rods = eco.get(`${user.id}.items`).filter(x => x === 'Fishing Rod').length
  var picks = eco.get(`${user.id}.items`).filter(x => x === 'Pickaxe').length
  var farms = eco.get(`${user.id}.items`).filter(x => x === 'Farm').length
  var cherries = eco.get(`${user.id}.items`).filter(x => x === 'Provato').length
  var ubers = eco.get(`${user.id}.items`).filter(x => x === 'UberFruit').length
  var gummis = eco.get(`${user.id}.items`).filter(x => x === 'Gummi').length
  const embed = new discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(':handbag: Your Inventory')
    .setDescription('This is the items you have.')
  if (rods) {
    embed.addField(':fishing_pole_and_fish: Fishing Rods', rods, true)
  }
  if (picks) {
    embed.addField(':pick: Pickaxes', picks, true)
  }
  if (farms) {
    embed.addField(':seedling: Farms', farms, true)
  }
  if (cherries) {
    embed.addField(':busts_in_silhouette: Provato Cherries', cherries, true)
  }
  if (gummis) {
    embed.addField(':lock: Kodo Gummies', gummis, true)
  }
  if (ubers) {
    embed.addField(':apple: UberFruits', ubers, true)
  }
  return msg.channel.send(embed)
}

module.exports.help = {
  name: 'inv',
  aliases: ['inventory'],
  usage: 'inv [user]',
  description: 'Checks a user\'s inventory.',
  category: 'Economy',
  cooldown: 0
}
