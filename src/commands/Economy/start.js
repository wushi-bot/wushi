import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js'
import db from 'quick.db'
import utils from '../../utils/utils'
const eco = new db.table('economy') 

class StartCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'start',
      description: 'Registers your bank account.',
      category: 'Economy',
      aliases: [],
      usage: 'start',
      cooldown: 2.5
    })
  }

  async run (bot, msg, args) {
    if (eco.get(`${msg.author.id}.started`)) {
      return this.client.emit('customError', 'You already have a bank account!', msg)
    }
    eco.set(`${msg.author.id}.started`, true)
    eco.set(`${msg.author.id}.balance`, 100)
    eco.set(`${msg.author.id}.bank`, 0)
    eco.set(`${msg.author.id}.prestige`, 1)
    eco.set(`${msg.author.id}.multiplier`, 1)
    const e = new MessageEmbed()
      .setColor(msg.member.roles.highest.color)
      .addField('<:check:820704989282172960> Success!', `Successfully created your bank account. See the help page for :bank: **Economy** to learn how to make money!`)
    msg.reply(e)
  }
}

module.exports = StartCommand