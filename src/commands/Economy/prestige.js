import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js-light'
 
import romanizeNumber from 'romanize-number'
import db from 'quick.db'
import utils from '../../utils/utils'
const eco = new db.table('economy') 

class PrestigeCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'prestige',
      description: 'Prestige in wushi\'s economy!',
      category: 'Economy',
      aliases: ['pr'],
      usage: 'prestige',
      cooldown: 0
    })
  }

  async run (bot, msg, args) {
    if (!eco.get(`${msg.author.id}.started`)) return this.client.emit('customError', 'You don\'t have a bank account!', msg)
    if (eco.get(`${msg.author.id}.balance`) < 100000) return this.client.emit('customError', 'You need :coin: **200,000** to prestige!', msg)
    eco.set(`${msg.author.id}.bank`, 0)
    eco.set(`${msg.author.id}.balance`, 0)
    eco.add(`${msg.author.id}.prestige`, 1)
    eco.add(`${msg.author.id}.luck`, 1)
    eco.set(`${msg.author.id}.multiplier`, 2)
    let prestige = eco.get(`${msg.author.id}.prestige`) || 1
    const e = new MessageEmbed()
      .setColor(msg.member.roles.highest.color)
      .addField('<:check:820704989282172960> Success!', `Sucessfully prestiged to **Prestige ${romanizeNumber(prestige)}**!`)
      .addField(':medal: Rewards', `+ **1 Prestige Level**\n+ **2% Multiplier**\n+ **1 Luck Stat**`)
    return msg.reply(e)
  }
}

module.exports = PrestigeCommand 
