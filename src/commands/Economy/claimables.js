import Command from '../../structs/command'
import ms from 'ms'
import { MessageEmbed } from 'discord.js'
import db from 'quick.db'
const eco = new db.table('economy')

class ClaimablesCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'claimables',
      description: 'Check to see the cooldowns of your claimables.',
      category: 'Economy',
      aliases: ['cl'],
      usage: 'claimables',
      cooldown: 3.5
    })
  }

  async run (bot, msg, args) {
    if (!eco.get(`${msg.author.id}.started`)) return this.client.emit('customError', 'You don\'t have a bank account!', msg)
    const e = new MessageEmbed()
      .setColor(msg.member.roles.highest.color)
    let time = new Date().getTime()
    if (!eco.get(`${msg.author.id}.daily`)) e.addField(':date: Daily', `<:check:820704989282172960>`)
    else if (eco.get(`${msg.author.id}.daily`) >= new Date().getTime()) e.addField(':date: Daily', `<:cross:821028198330138644> (**${ms(eco.get(`${msg.author.id}.daily`) - time, { long: true })}**)`)
    else e.addField(':date: Daily', `<:check:820704989282172960>`)
    msg.reply(e)
  }
}

module.exports = ClaimablesCommand