import discord from 'discord.js'
import db from 'quick.db'
import utils, { getMember } from '../utils/utils'
import Command from '../models/Command'
const eco = new db.table('economy')
const serverEco = new db.table('serverEco')
const cfg = new db.table('config')

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
    const user = utils.getMember(msg, args[0]) || msg.member
    if (!eco.get(`${user.user.id}.started`)) {
      const embed = new discord.MessageEmbed()
        .setAuthor(`${user.user.username}#${user.user.discriminator}`, user.user.avatarURL())
        .setColor('#f20f0f')
        .setDescription('You (or the user you inputted) has no account setup! Set one up using `.start`.')
        .setFooter(`Requested by ${msg.author.username}.`, msg.author.avatarURL())
      return msg.channel.send(embed)
    }
    let gems = serverEco.get(`${msg.guild.id}.${user.user.id}.gems`)
    gems = gems || 0
    if (!cfg.get(`${msg.guild.id}.disabled`).includes('Server Shop')) {
      msg.channel.send(`**${user.user.username}** currently has **${utils.addCommas(eco.get(`${user.user.id}.balance`))} coins** & **${utils.addCommas(gems)} gems**.`)
    } else {
      msg.channel.send(`**${user.user.username}** currently has **${utils.addCommas(eco.get(`${user.user.id}.balance`))} coins**`)
    }
  }
}

module.exports = Balance
