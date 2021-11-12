import { CommandInteraction } from 'discord.js'
import { getItem, getItems } from '../utils/shop'
import { toTitleCase, addCommas } from '../utils/functions'
import { getUser } from '../utils/database'

import Bot from '../models/Client'
import Command from '../models/Command'

class BuyCommand extends Command {
  constructor() {
    super(
      'buy', 
      'Buy an item from the shop.'
    ),
    this.addStringOption(option =>
      option
        .setName('item')
        .setDescription('The item ID you wish to buy.')  
        .setRequired(true)
    )
  }

  async execute(interaction: CommandInteraction, client: Bot) {
    let items = await getItems()
    let item = interaction.options.getString('item').toLowerCase()
    if (!items.some(i => i.id === item)) {
      return await interaction.reply({ content: 'Invalid item, try again!', ephemeral: true })
    }
    let user = await getUser(interaction.member.user.id)
    item = await getItem(item) // @ts-ignore
    if (item.price > user.balance) { // @ts-ignore
      return await interaction.reply({ content: `You don't have enough for this item. You are short :coin: **${await addCommas(item.price - user.balance)}**.`})
    } // @ts-ignore
    user.balance -= item.price 
    if (!user.items) user.items = {} // @ts-ignore
    let amount = user.items[item.id] || 0
    amount += 1 // @ts-ignore
    user.items[item.id] = amount
    console.log(user.items[item.id])
    user.markModified('items')
    user.save()
    await interaction.reply({ // @ts-ignore
      content: `Successfully purchased ${item.emoji} **${item.display}**! | Description: ${item.description}` 
    })
    
  }
}

module.exports = BuyCommand