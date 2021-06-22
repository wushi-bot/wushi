import Command from '../../classes/Command'
import { MessageEmbed } from 'discord.js'
import db from 'quick.db'
import { addMoney } from '../../utils/economy'
import { addCommas } from '../../utils/utils'
import ms from 'ms'

const cfg = new db.table('config')
const eco = new db.table('economy')

 
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
    const color = cfg.get(`${msg.author.id}.color`) || msg.member.roles.highest.color
    if (!eco.get(`${msg.author.id}.started`)) {
      this.client.emit('customError', 'You don\'t have a bank account!', msg)
      return false
    }
    if (!eco.get(`${msg.author.id}.votedTop`) && !eco.get(`${msg.author.id}.votedDBL`)) {
      this.client.emit('customError', 'You haven\'t upvoted the bot on a bot list, upvote the bot on these bot lists: \n\n• [discordbotlist.com](https://discordbotlist.com/bots/wushi/upvote)\n• [top.gg](https://top.gg/bot/755526238466080830/vote)', msg)
      return false
    }
    if (eco.get(`${msg.author.id}.weekly`)) {
      let time = new Date().getTime()
      if (eco.get(`${msg.author.id}.weekly`) >= time) return this.client.emit('customError', `You're still on cooldown for this command! Please wait **${ms(eco.get(`${msg.author.id}.weekly`) - time, { long: true })}**.`, msg)
      const amount = addMoney(msg.author.id, 10000)
      eco.set(`${msg.author.id}.weekly`, new Date().getTime() + 604800000)
      const embed = new MessageEmbed()
        .setColor(color)
        .addField('<:check:820704989282172960> Success!', `Successfully claimed :coin: **${addCommas(amount)}** for this week, you can claim this again in **7 days**.`)
      msg.reply({ embeds: [embed] })
    } else {
      const amount = addMoney(msg.author.id, 10000)
      eco.set(`${msg.author.id}.weekly`, new Date().getTime() + 604800000)
      const embed = new MessageEmbed()
        .setColor(color)
        .addField('<:check:820704989282172960> Success!', `Successfully claimed :coin: **${addCommas(amount)}** for this week, you can claim this again in **7 days**.`)
      msg.reply({ embeds: [embed] })
    }
    return true
  }
}

module.exports = WeeklyCommand