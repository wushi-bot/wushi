import Command from '../models/Command'
import { MessageEmbed } from 'discord.js'
import utils from '../utils/utils'
import db from 'quick.db'

const eco = new db.table('economy')

class RobCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'rob',
      description: 'Robs a user for a given percentage in their balance. (although this increases the percentage of failure)',
      aliases: ['robbery'],
      category: 'Income',
      usage: 'rob [@user] [percent]',
      cooldown: 150
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
    var chance = utils.getRandomInt(1, 100)
    const user = msg.guild.members.cache.get(args[0]) || msg.mentions.members.first() || msg.member
    if (user === msg.member) {
      const embed = new MessageEmbed()
        .setAuthor(msg.author.tag, msg.author.avatarURL())
        .setDescription('Personally, I wouldn\'t try to rob myself, but hey.')
        .setColor('#f20f0f')
      return msg.channel.send(embed)
    }
    if (eco.get(`${user.user.id}.balance`) === 0) {
      const embed = new MessageEmbed()
        .setAuthor(msg.author.tag, msg.author.avatarURL())
        .setDescription('The user you are trying to rob has no coins in their balance.')
        .setColor('#f20f0f')
      return msg.channel.send(embed)
    }
    let failed
    let profit
    let profitPercentage
    if (eco.get(`${user.user.id}.items`).includes('padlock')) {
      failed = 'padlock'
    } else if (chance > 50) {
      failed = true
      profit = utils.getRandomInt(300, 1200)
      eco.subtract(`${msg.author.id}.balance`, profit)
    } else {
      failed = false
      profitPercentage = utils.getRandomInt(30, 80)
      profit = eco.get(`${user.user.id}.balance`) * (profitPercentage * 0.10)
      eco.add(`${msg.author.id}.balance`, profit)
      eco.subtract(`${user.user.id}.balance`, profit)
    }
    const embed = new MessageEmbed()
      .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
      .setColor('#0099ff')
      .setDescription(`:no_pedestrians: Attempting to rob **${user.user.tag}**`)
    msg.channel.send(embed).then(m => {
      if (!failed) {
        embed
          .addField('New Balance', `:coin: **${utils.addCommas(eco.get(`${msg.author.id}.balance`))}**`, true)
          .addField('Amount robbed', `:coin: **${utils.addCommas(Math.floor(profit))}**`, true)
          .setDescription(`:no_pedestrians: Successfully robbed **${user.user.tag}**! You got :coin: **${utils.addCommas(Math.floor(profit))}** (${profitPercentage}%) coins!`)
          .setTimestamp()
        msg.channel.send(`${user.user.mention}`)
      } else if (failed) {
        embed
          .addField('New Balance', `:coin: **${utils.addCommas(eco.get(`${msg.author.id}.balance`))}**`, true)
          .addField('Coins lost', `:coin: **${utils.addCommas(Math.floor(profit))}**`, true)
          .setDescription(`:no_pedestrians: You messed up while robbing** ${user.user.tag}**! You lost :coin: **${utils.addCommas(Math.floor(profit))}** coins!`)
          .setTimestamp()
      } else if (failed === 'padlock') {
        embed
          .setDescription(`:no_pedestrians: The robbery was stopped due to **${user.user.tag}** having a :lock: **Padlock**! However, the padlock was broken because of this!`)
          .setTimestamp()
        const i = eco.get(`${user.user.id}.items`)
        const newI = utils.removeA(i, 'padlock')
        eco.set(`${user.user.id}.items`, newI)
        msg.channel.send(`${user.user.mention}`)
      }
      setTimeout(() => {
        m.edit(embed)
      }, 1500)
    })
  }
}

module.exports = RobCommand
