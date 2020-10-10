import discord from 'discord.js'
import db from 'quick.db'
import utils from '../utils/utils'
import Command from '../models/Command'
const eco = new db.table('economy')

class Balance extends Command {
  constructor (client) {
    super(client, {
      name: 'bal',
      description: 'See the balance of yourself or other users.',
      aliases: ['balance'],
      category: 'Economy',
      usage: 'bal [user]',
      cooldown: 0
    })
  }

  async run (bot, msg, args) {
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
      .setDescription(`**${user.username}**'s Balance: **${utils.addCommas(Math.floor(eco.get(`${user.id}.balance`)))}** :moneybag: Coins`)
      .setFooter(`Requested by ${msg.author.username}.`, msg.author.avatarURL())
    msg.channel.send(embed)
  }
}

module.exports = Balance
