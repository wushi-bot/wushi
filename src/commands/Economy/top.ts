import Command from '../../classes/Command'
import { addCommas, getColor, getPrefix } from '../../utils/utils'
import { MessageEmbed } from 'discord.js'

import User from '../../models/User'

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
    const color = await getColor(bot, msg.member)
    const prefix = await getPrefix(msg.guild.id)
    let list = []
    msg.guild.members.cache.array().forEach(async entry => { // @ts-ignore
      const user = this.client.users.cache.get(entry.user.id)
      const userProfile = await User.findOne({
        id: user.id
      })
      if (userProfile && userProfile.started) {
        list.push({ id: user.id, bal: userProfile.balance, bank: userProfile.bank })
        console.log(userProfile)
      }
    })
    list.sort(function (a, b) { return (b.bal + b.bank) - (a.bal + a.bank) })
    list = list.slice(0, 9)

    const embed = new MessageEmbed()
      .setColor(color)
      .setTitle('🏆 Richest people in your server.')
    if (list.length === 0) embed.setDescription('There are no user profiles in this server.')
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