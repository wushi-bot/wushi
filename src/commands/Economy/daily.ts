import Command from '../../classes/Command'
import { MessageEmbed } from 'discord.js'
import  { addMoney } from '../../utils/economy'
import { addCommas, getColor, getPrefix } from '../../utils/utils'
import ms from 'ms'
import User from '../../models/User'

class DailyCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'daily',
      description: 'Get daily money.',
      category: 'Economy',
      aliases: ['d'],
      usage: 'daily',
      cooldown: 0
    })
  }

  async run (bot, msg, args) {
    const color = await getColor(bot, msg.member)
    const user = await User.findOne({
      id: msg.author.id
    }).exec()
    const prefix = await getPrefix(msg.guild.id)
    if (!user || !user.started) {
      this.client.emit('customError', `You don't have a bank account! Create one using \`${prefix}start\`.`, msg)
      return false
    }
    let time = new Date().getTime()
    if (user.daily) {
      if (user.daily >= time) {
        this.client.emit('customError', `You're still on cooldown for this command! Please wait **${ms(user.daily - time, { long: true })}**.`, msg)
        return false
      }
      const amount = await addMoney(msg.author.id, 500)
      user.daily = new Date().getTime() + 86400000
      user.save()
      const embed = new MessageEmbed()
        .setColor(color)
        .addField('<:check:820704989282172960> Success!', `Successfully claimed :coin: **${addCommas(amount)}** for today, you can claim this again in **${ms(user.daily - time, { long: true })}**.`)
      msg.reply({ embeds: [embed] })
      return true
    } else {
      const amount = await addMoney(msg.author.id, 500)
      user.daily = new Date().getTime() + 86400000
      user.save()
      const embed = new MessageEmbed()
        .setColor(color)
        .addField('<:check:820704989282172960> Success!', `Successfully claimed :coin: **${addCommas(amount)}** for today, you can claim this again in **${ms(user.daily - time, { long: true })}**.`)
      msg.reply({ embeds: [embed] })
      return true
    }
  } 
}

module.exports = DailyCommand