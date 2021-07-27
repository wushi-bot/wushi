import Command from '../../classes/Command'
import { MessageEmbed } from 'discord.js'
import { addMoney } from '../../utils/economy'
import { addCommas, getColor, getPrefix } from '../../utils/utils'
import ms from 'ms'

import User from '../../models/User'

class WeeklyCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'weekly',
      description: 'Redeem coins weekly!',
      category: 'Economy',
      aliases: [],
      usage: 'weekly',
      cooldown: 0
    })
  }

  async run (bot, msg, args) {
    const color = await getColor(bot, msg.member)
    const prefix = await getPrefix(msg.guild.id)
    const user = await User.findOne({
      id: msg.author.id
    }).exec()
    if (!user || !user.started) {
      this.client.emit('customError', `You don't have a bank account! Create one using \`${prefix}start\`.`, msg)
      return false
    }
    if (!user.votedTop && !user.votedDBL) {
      this.client.emit('customError', 'You haven\'t upvoted the bot on a bot list, upvote the bot on these bot lists: \n\n• [discordbotlist.com](https://discordbotlist.com/bots/wushi/upvote)\n• [top.gg](https://top.gg/bot/755526238466080830/vote)', msg)
      return false
    }
    if (user.weekly) {
      let time = new Date().getTime()
      if (user.weekly >= time) return this.client.emit('customError', `You're still on cooldown for this command! Please wait **${ms(user.weekly - time, { long: true })}**.`, msg)
      const amount = addMoney(msg.author.id, 10000)
      user.weekly = new Date().getTime() + 604800000
      user.save()
      const embed = new MessageEmbed()
        .setColor(color)
        .addField('<:check:820704989282172960> Success!', `Successfully claimed :coin: **${addCommas(amount)}** for this week, you can claim this again in **7 days**.`)
      msg.reply({ embeds: [embed] })
    } else {
      const amount = addMoney(msg.author.id, 10000)
      user.weekly = new Date().getTime() + 604800000
      user.save()
      const embed = new MessageEmbed()
        .setColor(color)
        .addField('<:check:820704989282172960> Success!', `Successfully claimed :coin: **${addCommas(amount)}** for this week, you can claim this again in **7 days**.`)
      msg.reply({ embeds: [embed] })
    }
    return true
  }
}

module.exports = WeeklyCommand