import db from 'quick.db'
import Command from '../models/Command'
import utils from '../utils/utils'
import { MessageEmbed } from 'discord.js'

const eco = new db.table('economy')

class WithdrawCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'withdraw',
      description: 'Withdraw coins from your bank into your balance.',
      category: 'Economy',
      aliases: ['with'],
      usage: 'withdraw [all|half|amount]',
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    if (!eco.get(`${msg.author.id}.started`)) {
      const embed = new discord.MessageEmbed()
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setColor('#f20f0f')
        .setDescription('**Error:** You do not have a bank account!')
      return msg.channel.send(embed)
    }
    let balance = eco.get(`${msg.author.id}.balance`)
    let bank = eco.get(`${msg.author.id}.bank`)
    let maxBank = eco.get(`${msg.author.id}.maxBank`)
    if (!maxBank) {
      maxBank = 500
      eco.set(`${msg.author.id}.maxBank`, 500)
    }

    if (isNaN(args[0])) {
      if (args[0] === 'all') {
        if (bank === 0) {
          const embed = new MessageEmbed()
            .setAuthor(msg.author.tag, msg.author.avatarURL())
            .setDescription('You have no coins in your bank.')
            .setColor('#f20f0f')
          return msg.channel.send(embed)
        } else {
          const amount = bank
          eco.subtract(`${msg.author.id}.bank`, amount)
          eco.add(`${msg.author.id}.balance`, amount)
          const embed = new MessageEmbed()
            .setAuthor(msg.author.tag, msg.author.avatarURL())
            .setDescription('Transaction Complete! The details of the transaction are provided below...')
            .addField('Transaction Info', `- :coin: **${utils.addCommas(amount)}** → **:bank: Bank**\n+ :coin: **${utils.addCommas(amount)}** → **:purse: Purse**`, true)
            .addField('New Balance', `:bank: **Bank:** ${utils.addCommas(eco.get(`${msg.author.id}.bank`))} (${utils.addCommas(maxBank)}) / :purse: **Purse:** ${utils.addCommas(eco.get(`${msg.author.id}.balance`))}`, true)
            .setColor('#0099ff')
          return msg.channel.send(embed)
        }
      } else if (args[0] === 'half') {
        if (bank === 0) {
          const embed = new MessageEmbed()
            .setAuthor(msg.author.tag, msg.author.avatarURL())
            .setDescription('You have no coins in your bank.')
            .setColor('#f20f0f')
          return msg.channel.send(embed)
        } else {
          let amount = bank
          eco.subtract(`${msg.author.id}.bank`, Math.floor(amount / 2))
          eco.add(`${msg.author.id}.balance`, Math.floor(amount / 2))
          const embed = new MessageEmbed()
            .setAuthor(msg.author.tag, msg.author.avatarURL())
            .setDescription('Transaction Complete! The details of the transaction are provided below...')
            .addField('Transaction Info', `- :coin: **${utils.addCommas(Math.floor(amount / 2))}** → **:bank: Bank**\n+ :coin: **${utils.addCommas(Math.floor(amount / 2))}** → **:purse: Purse**`, true)
            .addField('New Balance', `:bank: **Bank:** ${utils.addCommas(eco.get(`${msg.author.id}.bank`))} (${utils.addCommas(maxBank)}) / :purse: **Purse:** ${utils.addCommas(eco.get(`${msg.author.id}.balance`))}`, true)
            .setColor('#0099ff')
          return msg.channel.send(embed)
        }
      } else {
        return msg.channel.send('Please insert a valid amount.')
      }
    } else {
      if (args[0] > bank) {
        const embed = new MessageEmbed()
          .setAuthor(msg.author.tag, msg.author.avatarURL())
          .setDescription('Your amount that you want to withdraw is more than what you have.')
          .setColor('#f20f0f')
        return msg.channel.send(embed)
      } else {
        const amount = args[0]
        eco.subtract(`${msg.author.id}.bank`, amount)
        eco.add(`${msg.author.id}.balance`, amount)
        const embed = new MessageEmbed()
          .setAuthor(msg.author.tag, msg.author.avatarURL())
          .setDescription('Transaction Complete! The details of the transaction are provided below...')
          .addField('Transaction Info', `- :coin: **${utils.addCommas(amount)}** → **:bank: Bank**\n+ :coin: **${utils.addCommas(amount)}** → **:purse: Purse**`, true)
          .addField('New Balance', `:bank: **Bank:** ${utils.addCommas(eco.get(`${msg.author.id}.bank`))} (${utils.addCommas(maxBank)}) / :purse: **Purse:** ${utils.addCommas(eco.get(`${msg.author.id}.balance`))}`, true)
          .setColor('#0099ff')
        return msg.channel.send(embed)
      }
    }
  }
}

module.exports = WithdrawCommand
