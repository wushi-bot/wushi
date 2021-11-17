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
    this.addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('The amount of items you want to buy.')
        .setRequired(false)  
    )
  }

  async execute(interaction: CommandInteraction, client: Bot) {
    let items = await getItems()
    let quantity = interaction.options.getInteger('amount') || 1
    let item = interaction.options.getString('item').toLowerCase()
    if (!items.some(i => i.id === item)) {
      return await interaction.reply({ content: 'Invalid item, try again!', ephemeral: true })
    }
    let user = await getUser(interaction.member.user.id)
    item = await getItem(item) // @ts-ignore
    if (item.price * quantity > user.balance) { // @ts-ignore
      return await interaction.reply({ content: `You don't have enough for this item. You are short :coin: **${await addCommas(item.price - user.balance)}**.`})
    } // @ts-ignore
    if (item.max) { // @ts-ignore
      if (user.items[item.id] >= item.max) {
        return await interaction.reply({ content: `You already have too much of that item. Try buying another item!`, ephemeral: true })
      } // @ts-ignore
      if (user.items[item.id] + quantity > item.max) {
        return await interaction.reply({ content: `Buying this amount of items would set you over the maximum amount of items, please try a lower number.`, ephemeral: true })
      }
    }
    // @ts-ignore
    user.balance -= item.price * quantity
    if (!user.items) user.items = {} // @ts-ignore
    let amount = user.items[item.id] || 0
    amount += quantity // @ts-ignore
    user.items[item.id] = amount
    user.markModified('items') // @ts-ignore
    if (item.type === 'rod') { // @ts-ignore
      user.fishing_rod = item.id
      user.markModified('fishing_rod')
    }
    user.save()
    await interaction.reply({ // @ts-ignore
      content: `<:check:820704989282172960> Successfully purchased **${quantity}** ${item.emoji} **[${item.display}](https://dummylinkforthetimebeing.com)**, your new balance is now :coin: **${await addCommas(Math.floor(user.balance))}**! | ${item.description}` 
    })
    
  }
}

module.exports = BuyCommand