import { MessageEmbed } from 'discord.js'
import db from 'quick.db'
import utils from '../utils/utils'
import Command from '../models/Command'
const eco = new db.table('economy')
const serverEco = new db.table('serverEco')
const cfg = new db.table('config')

class Balance extends Command {
  constructor (client) {
    super(client, {
      name: 'balance',
      description: 'See the balance of yourself or other users.',
      aliases: ['bal'],
      category: 'Income',
      usage: 'bal [user]',
      cooldown: 0
    })
  }

  async run (bot, msg, args) {
    const user = msg.guild.members.cache.get(args[0]) || msg.mentions.members.first() || msg.member
    if (!eco.get(`${user.user.id}.started`)) {
      const embed = new MessageEmbed()
        .setAuthor(`${user.user.username}#${user.user.discriminator}`, user.user.avatarURL())
        .setColor('#f20f0f')
        .setDescription('You (or the user you inputted) has no account setup! Set one up using `.start`.')
        .setFooter(`Requested by ${msg.author.username}.`, msg.author.avatarURL())
      return msg.channel.send(embed)
    }
    let gems = serverEco.get(`${msg.guild.id}.${user.user.id}.gems`)
    let bank = eco.get(`${user.user.id}.bank`)
    let maxBank = eco.get(`${user.user.id}.maxBank`)

    gems = gems || 0
    bank = bank || 0
    maxBank = maxBank || 0
    const embed = new MessageEmbed()
      .setAuthor(msg.author.tag, msg.author.avatarURL())
      .setDescription(`This is **${msg.author.username}**'s balance & bank balance.`)
      .addField(':purse: Balance', `:coin: **${utils.addCommas(eco.get(`${user.user.id}.balance`))}**`, true)
      .addField(':bank: Bank', `:coin: **${utils.addCommas(bank)}** / **${utils.addCommas(maxBank)}**`, true)
      .setColor('#0099ff')
      .setTimestamp()
      .setFooter('You get more bank balance by gaining coins.')
    if (!cfg.get(`${msg.guild.id}.disabled`).includes('Server Shop')) {
      embed.addField(':gem: Gems', `:gem: **${utils.addCommas(gems)}**`, true)
    }
    msg.channel.send(embed)
  }
}

module.exports = Balance
