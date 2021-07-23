import Command from '../../classes/Command'
import { addCommas, getItem, allItems, getPrefix, getColor } from '../../utils/utils'
import { MessageEmbed } from 'discord.js'

class ItemCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'item',
      description: 'Get the information about an item.',
      category: 'Economy',
      aliases: ['it'],
      usage: 'item <id>',
      cooldown: 5
    })
  }

  async run (bot, msg, args) {
    if (!args[0]) {
        this.client.emit('customError', `You need to insert an item.`, msg)
        return false
    }
    const color = await getColor(bot, msg.member)
    const prefix = await getPrefix(msg.guild.id)
    const item = getItem(allItems(), args[0])
    if (!item) {
        this.client.emit('customError', `You need to insert a *valid* item.`, msg)
        return false 
    }
    const embed = new MessageEmbed()
        .setColor(color)
        .setTitle(`${item.emoji} ${item.display}`)
        .addField(':bank: Price', `:coin: **${addCommas(Math.floor(item.price))}**`)
        .addField(`:gem: Sell price`, `:coin: **${addCommas(Math.floor(item.sell_price))}**`)
        .addField(':pencil: Description', `${item.description.replace('[PRE]', prefix)}`)
    msg.reply({ embeds: [embed] })
    return true
  }
}

module.exports = ItemCommand