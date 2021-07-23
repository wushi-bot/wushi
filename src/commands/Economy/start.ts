import Command from '../../classes/Command'
import { MessageEmbed, MessageButton, MessageActionRow } from 'discord.js'
import { getPrefix, getColor } from '../../utils/utils'

import User from '../../models/User'

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
    const color = await getColor(bot, msg.member)
    const prefix = await getPrefix(msg.guild.id)
    const user = await User.findOne({
      id: msg.author.id
    }).exec()
    if (!user || !user.started) {
      this.client.emit('customError', `You don't have a bank account! Create one using \`${prefix}start\`.`, msg)
      return false
    }
    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setLabel('Fish')
          .setCustomId('fish')
          .setEmoji('🎣')
          .setStyle('SECONDARY'),   
    )
    user.started = true
    user.balance = 100
    user.bank = 0
    user.prestige = 1
    user.multiplier = 1
    user.items.flimsy_fishing_rod = 1
    user.pets = {
      active: null,
      list: [],
      energy: 0,
      food: 0,
      income: 0
    }
    user.skills = {
      fishing: {
        exp: 0,
        level: 1,
        req: 100
      }, 
      hunting: {
        exp: 0,
        level: 1,
        req: 100
      }, 
      mining: {
        exp: 0,
        level: 1,
        req: 100
      },
      farming: {
        exp: 0,
        level: 1,
        req: 100
      }                
    }
    user.save()
    const e = new MessageEmbed()
      .setColor(color)
      .addField('<:check:820704989282172960> Success!', `Successfully created your bank account. You've also received a :fishing_pole_and_fish: **Flimsy Fishing Rod**, you may fish using \`${getPrefix(msg.guild.id)}fish\`.`)
    const message = await msg.reply({ embeds: [e], components: [row] })
    const filter = i => i.customID === 'fish' && i.user.id === msg.author.id
    message.awaitMessageComponentInteraction(filter, { time: 15000 })
        .then(async i => {
          const cmd = this.client.commands.get('fish')
          await i.update({ components: [] })
          await cmd.run(this.client, msg, args)
        })
        .catch(() => {})
    return true
  }
}

module.exports = StartCommand