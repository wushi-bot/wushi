import Command from '../../classes/Command'
import { MessageEmbed } from 'discord.js'
 
import romanizeNumber from 'romanize-number'
import { addCommas, getPrefix, getColor } from '../../utils/utils'

import User from '../../models/User'

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
    const color = await getColor(bot, msg.member)
    const prefix = await getPrefix(msg.guild.id)
    const user = await User.findOne({
      id: msg.author.id
    }).exec()
    if (!user || !user.started) {
      this.client.emit('customError', `You don't have a bank account! Create one using \`${prefix}start\`.`, msg)
      return false
    }
    if (user.balance < (200000 * user.prestige)) {
      this.client.emit('customError', `You need :coin: **${addCommas((200000 * user.prestige))}** to prestige!`, msg)
      return false
    }
    user.bank = 0
    user.balance = 0
    user.prestige =+ 1
    user.items = {}
    user.multiplier += 1
    user.items.flimsy_fishing_rod = 1
    let prestige = user.prestige || 1
    user.save()
    const e = new MessageEmbed()
      .setColor(color)
      .addField('<:check:820704989282172960> Success!', `Sucessfully prestiged to **Prestige ${romanizeNumber(prestige)}**!`)
      .addField(':medal: Rewards', `+ **1 Prestige Level**\n+ **1% Multiplier**`)
    msg.reply({ embeds: [e] })
    return true
  }
}

module.exports = PrestigeCommand 
