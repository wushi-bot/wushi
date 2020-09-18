const db = require('quick.db')
const discord = require('discord.js')
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

module.exports.run = async (bot, msg, args) => {
  let user = msg.mentions.users.first()
  if (!user) {
    user = msg.author
  }
  if (!eco.get(`${user.id}.started`)) {
    const embed = new discord.MessageEmbed()
      .setTitle('Error!')
      .setColor('#f20f0f')
      .setDescription('You (or the user you inputted) has no account setup! Set one up using `.start`.')
      .setFooter(`Requested by ${msg.author.username}.`, msg.author.avatarURL())
    return msg.channel.send(embed)
  }
  const embed = new discord.MessageEmbed()
    .setTitle(`${user.username}'s Balance`)
    .setColor('#77e86b')
    .setDescription(`**${user.username}**'s Balance: **${addCommas(Math.floor(eco.get(`${user.id}.balance`)))}** :moneybag: Coins`)
    .setFooter(`Requested by ${msg.author.username}.`, msg.author.avatarURL())
  msg.channel.send(embed)
}

module.exports.help = {
  name: 'bal',
  description: 'See the balance of yourself or other users.',
  aliases: ['balance'],
  category: 'Economy',
  usage: 'bal [user]',
  cooldown: 0
}
