import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js-light'
import ecoUtils from '../../utils/economy'
import utils from '../../utils/utils'
import ms from 'ms'
import db from 'quick.db'
 
const eco = new db.table('economy') 
const cfg = new db.table('config') 

class DailyCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'daily',
      description: 'Get daily money.',
      category: 'Economy',
      aliases: ['d'],
      usage: 'daily',
      cooldown: false
    })
  }

  async run (bot, msg, args) {
    const color = cfg.get(`${msg.author.id}.color`) || msg.member.roles.highest.color
    if (!eco.get(`${msg.author.id}.started`)) {
      this.client.emit('customError', 'You don\'t have a bank account!', msg)
      return false
    }
    if (eco.get(`${msg.author.id}.daily`)) {
      let time = new Date().getTime()
      if (eco.get(`${msg.author.id}.daily`) >= time) {
        this.client.emit('customError', `You're still on cooldown for this command! Please wait **${ms(eco.get(`${msg.author.id}.daily`) - time, { long: true })}**.`, msg)
        return false
      }
      const amount = ecoUtils.addMoney(msg.author.id, 500)
      eco.set(`${msg.author.id}.daily`, new Date().getTime() + 86400000)
      const embed = new MessageEmbed()
        .setColor(color)
        .addField('<:check:820704989282172960> Success!', `Successfully claimed :coin: **${utils.addCommas(amount)}** for today, you can claim this again in **24 hours**.`)
      msg.reply(embed)
      return true
    } else {
      const amount = ecoUtils.addMoney(msg.author.id, 500)
      eco.set(`${msg.author.id}.daily`, new Date().getTime() + 86400000)
      const embed = new MessageEmbed()
        .setColor(color)
        .addField('<:check:820704989282172960> Success!', `Successfully claimed :coin: **${utils.addCommas(amount)}** for today, you can claim this again in **24 hours**.`)
      msg.reply(embed)
      return true
    }
  } 
}

module.exports = DailyCommand