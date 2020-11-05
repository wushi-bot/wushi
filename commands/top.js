import Command from '../models/Command'
import utils from '../utils/utils'
import { MessageEmbed } from 'discord.js'
import db from 'quick.db'

const eco = new db.table('economy')

class TopCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'top',
      description: 'Gets the top balances in the server.',
      category: 'Economy',
      aliases: ['top-10', 'leaderboard', 'lb', 'top10'],
      usage: 'top',
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    const list = []
    eco.all().forEach(entry => {
      const user = this.client.users.cache.get(entry.ID)
      if (msg.guild.member(user)) {
        list.push({ id: entry.ID, bal: entry.data.balance, bank: entry.data.bank })
      }
    })
    list.sort(function (a, b) { return (b.bal + b.bank) - (a.bal + a.bank) })
    list.slice(0, 9)

    const embed = new MessageEmbed()
      .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
      .setColor('#0099ff')
      .setDescription(':trophy: Top 10 users in your server.')
    let x = 1
    list.forEach(i => {
      const user = this.client.users.cache.get(i.id)
      if (x === 1) {
        embed.addField(`:first_place: ${user.username}#${user.discriminator}`, `Balance: :coin: **${utils.addCommas(i.bal + i.bank)}**`)
      } else if (x === 2) {
        embed.addField(`:second_place: ${user.username}#${user.discriminator}`, `Balance: :coin: **${utils.addCommas(i.bal + i.bank)}**`)
      } else if (x === 3) {
        embed.addField(`:third_place: ${user.username}#${user.discriminator}`, `Balance: :coin: **${utils.addCommas(i.bal + i.bank)}**`)
      } else {
        embed.addField(`#${x} ${user.username}#${user.discriminator}`, `Balance: :coin: **${utils.addCommas(i.bal + i.bank)}**`)
      }
      x++
    })
    return msg.channel.send(embed)
  }
}

module.exports = TopCommand
