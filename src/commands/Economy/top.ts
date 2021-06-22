import Command from '../../classes/Command'
import { addCommas } from '../../utils/utils'
import { MessageEmbed } from 'discord.js'
import db from 'quick.db'

const eco = new db.table('economy')
const cfg = new db.table('config')

class TopCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'top',
      description: 'Gets the top balances in the server.',
      category: 'Economy',
      aliases: ['rich', 'leaderboard', 'lb'],
      usage: 'top',
      cooldown: 5
    })
  }

  async run (bot, msg, args) {
    const color = cfg.get(`${msg.author.id}.color`) || msg.member.roles.highest.color
    let list = []
    eco.all().forEach(entry => { // @ts-ignore
      const user = this.client.users.cache.get(entry.ID)
      if (msg.guild.members.resolveID(user)) {
        list.push({ id: entry.ID, bal: entry.data.balance, bank: entry.data.bank })
      }
    })
    list.sort(function (a, b) { return (b.bal + b.bank) - (a.bal + a.bank) })
    list = list.slice(0, 9)

    const embed = new MessageEmbed()
      .setColor(color)
      .setFooter('🏆 Richest poeple in your server.')
    let x = 1
    list.forEach(i => {
      const user = this.client.users.cache.get(i.id)
      if (x === 1) {
        embed.addField(`:first_place: ${user.username}#${user.discriminator}`, `Balance: :coin: **${addCommas(i.bal + i.bank)}**`)
      } else if (x === 2) {
        embed.addField(`:second_place: ${user.username}#${user.discriminator}`, `Balance: :coin: **${addCommas(i.bal + i.bank)}**`)
      } else if (x === 3) {
        embed.addField(`:third_place: ${user.username}#${user.discriminator}`, `Balance: :coin: **${addCommas(i.bal + i.bank)}**`)
      } else {
        embed.addField(`#${x} ${user.username}#${user.discriminator}`, `Balance: :coin: **${addCommas(i.bal + i.bank)}**`)
      }
      x++
    })
    msg.reply({ embeds: [embed] })
    return true
  }
}

module.exports = TopCommand