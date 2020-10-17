import db from 'quick.db'
import discord from 'discord.js'
import Command from '../models/Command'
import utils from '../utils/utils'
const eco = new db.table('economy')

class Start extends Command {
  constructor (client) {
    super(client, {
      name: 'start',
      description: 'Start your bank account!',
      aliases: [],
      category: 'Economy',
      usage: 'start',
      cooldown: 0
    })
  }

  async run (bot, msg, args) {
    if (eco.get(`${msg.author.id}.started`)) {
      const embed = new discord.MessageEmbed()
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setColor('#f20f0f')
        .setDescription('**Error:** You already have an account!')
      return msg.channel.send(embed)
    } else {
      eco.set(`${msg.author.id}`, { balance: 50, items: ['Fishing Rod'], effects: [] })
      eco.set(`${msg.author.id}.started`, true)
      const embed = new discord.MessageEmbed()
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setColor('#ffa3e5')
        .setDescription(':checkered_flag: You have started a **bank account**!\n\nYou have received:\n\n+ **50 coins** :money_with_wings:\n+ **1 Fishing Rod** :fishing_pole_and_fish: ')
        .setFooter(`Do ${utils.getPrefix(msg.guild.id)}help to get see more commands to do! | You can also fish to get coins via ${utils.getPrefix(msg.guild.id)}fish`)
      return msg.channel.send(embed)
    }
  }
}

module.exports = Start
