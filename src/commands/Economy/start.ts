import Command from '../../classes/Command'
import { MessageEmbed, MessageButton, MessageActionRow } from 'discord.js'
import db from 'quick.db'
import { getPrefix } from '../../utils/utils'
const eco = new db.table('economy') 
const cfg = new db.table('config')

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
    const color = cfg.get(`${msg.author.id}.color`) || msg.member.roles.highest.color
    //if (eco.get(`${msg.author.id}.started`)) {
    //  this.client.emit('customError', 'You already have a bank account!', msg)
    //  return false
    //}
    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setLabel('Fish')
          .setCustomID('fish')
          .setEmoji('🎣')
          .setStyle('SECONDARY'),   
    )
    eco.set(`${msg.author.id}.started`, true)
    eco.set(`${msg.author.id}.balance`, 100)
    eco.set(`${msg.author.id}.bank`, 0)
    eco.set(`${msg.author.id}.prestige`, 1)
    eco.set(`${msg.author.id}.multiplier`, 1)
    eco.set(`${msg.author.id}.items.flimsy_fishing_rod`, 1)
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