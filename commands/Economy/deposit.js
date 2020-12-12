import db from 'quick.db'
import utils from '../../utils/utils'
import Command from '../../models/Command'
import { MessageEmbed } from 'discord.js'

const eco = new db.table('economy')

class DepositCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'deposit',
      description: 'Deposit coins into your bank.',
      category: 'Economy',
      aliases: ['dep'],
      usage: 'deposit [all|half|amount]',
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    if (!eco.get(`${msg.author.id}.started`)) {
      const embed = new MessageEmbed()
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setColor('#f20f0f')
        .setDescription('**Error:** You do not have a bank account!')
      return msg.channel.send(embed)
    }
    const balance = eco.get(`${msg.author.id}.balance`)

    if (isNaN(args[0])) {
      if (args[0] === 'all') {
        if (balance === 0) {
          const embed = new MessageEmbed()
            .setAuthor(msg.author.tag, msg.author.avatarURL())
            .setDescription('You have no coins.')
            .setColor('#f20f0f')
          return msg.channel.send(embed)
        } else {
          const amount = balance
          eco.add(`${msg.author.id}.bank`, amount)
          eco.subtract(`${msg.author.id}.balance`, amount)
          const embed = new MessageEmbed()
            .setAuthor(msg.author.tag, msg.author.avatarURL())
            .setDescription('Transaction Complete! The details of the transaction are provided below...')
            .addField('Transaction Info', `+ :coin: **${utils.addCommas(amount)}** → **:bank: Bank**\n- :coin: **${utils.addCommas(amount)}** → **:purse: Purse**`, true)
            .addField('New Balance', `:bank: **Bank:** ${utils.addCommas(eco.get(`${msg.author.id}.bank`))} / :purse: **Purse:** ${utils.addCommas(eco.get(`${msg.author.id}.balance`))}`, true)
            .setColor('#0099ff')
          return msg.channel.send(embed)
        }
      } else if (args[0] === 'half') {
        if (balance === 0) {
          const embed = new MessageEmbed()
            .setAuthor(msg.author.tag, msg.author.avatarURL())
            .setDescription('You have no coins.')
            .setColor('#f20f0f')
          return msg.channel.send(embed)
        } else {
          const amount = balance
          eco.add(`${msg.author.id}.bank`, Math.floor(amount / 2))
          eco.subtract(`${msg.author.id}.balance`, Math.floor(amount / 2))
          const embed = new MessageEmbed()
            .setAuthor(msg.author.tag, msg.author.avatarURL())
            .setDescription('Transaction Complete! The details of the transaction are provided below...')
            .addField('Transaction Info', `+ :coin: **${utils.addCommas(Math.floor(amount / 2))}** → **:bank: Bank**\n- :coin: **${utils.addCommas(Math.floor(amount / 2))}** → **:purse: Purse**`, true)
            .addField('New Balance', `:bank: **Bank:** ${utils.addCommas(eco.get(`${msg.author.id}.bank`))} / :purse: **Purse:** ${utils.addCommas(eco.get(`${msg.author.id}.balance`))}`, true)
            .setColor('#0099ff')
          return msg.channel.send(embed)
        }
      } else {
        const embed = new MessageEmbed()
          .setAuthor(msg.author.tag, msg.author.avatarURL())
          .setDescription('Please insert a valid amount.')
          .setColor('#f20f0f')
        return msg.channel.send(embed)
      }
    } else {
      if (args[0] > balance) {
        const embed = new MessageEmbed()
          .setAuthor(msg.author.tag, msg.author.avatarURL())
          .setDescription('Your amount that you want to deposit is more than what you have.')
          .setColor('#f20f0f')
        return msg.channel.send(embed)
      } else {
        const amount = args[0]
        eco.add(`${msg.author.id}.bank`, amount)
        eco.subtract(`${msg.author.id}.balance`, amount)
        const embed = new MessageEmbed()
          .setAuthor(msg.author.tag, msg.author.avatarURL())
          .setDescription('Transaction Complete! The details of the transaction are provided below...')
          .addField('Transaction Info', `+ :coin: **${utils.addCommas(amount)}** → **:bank: Bank**\n- :coin: **${utils.addCommas(amount)}** → **:purse: Purse**`, true)
          .addField('New Balance', `:bank: **Bank:** ${utils.addCommas(eco.get(`${msg.author.id}.bank`))} / :purse: **Purse:** ${utils.addCommas(eco.get(`${msg.author.id}.balance`))}`, true)
          .setColor('#0099ff')
        return msg.channel.send(embed)
      }
    }
  }
}

module.exports = DepositCommand
