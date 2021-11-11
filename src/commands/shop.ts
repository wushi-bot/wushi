import { CommandInteraction, MessageEmbed } from 'discord.js'
import { getCategories } from '../utils/shop'
import { toTitleCase, addCommas } from '../utils/functions'

import { emojis } from '../utils/constants'

import Bot from '../models/Client'
import Command from '../models/Command'

class ShopCommand extends Command {
  constructor() {
    super(
      'shop', 
      'Checks out a list of items in the shop.'
    ),
    this.addStringOption(option => 
      option 
        .setName('category')
        .setDescription('Shop category you want to view.')
    )
  }

  async execute(interaction: CommandInteraction, client: Bot) {
    let categories = await getCategories()
    if (!categories.includes(interaction.options.getString('category'))) {
      const embed = new MessageEmbed()
        .setColor('#303136')
        .setTitle(':shopping_cart: Shop')
      let list = []
      for await (let category of categories) {
        list.push(`**${emojis[category]} ${await toTitleCase(category)}** — View the catalog for **${await toTitleCase(category)}** using \`/shop ${category}\`.`)
      }
      embed.setDescription(list.join('\n'))
      await interaction.reply({ embeds: [embed] })
    } else {
      let choice = interaction.options.getString('category').toLowerCase()
      let json = require(`../../src/resources/items/${choice}.json`)
      
      const embed = new MessageEmbed()
        .setColor('#303136')
        .setTitle(':shopping_cart: Shop')
        .setFooter('Buy items using /buy <id>')
      for await (let item of json) {
        embed.addField(`${item.emoji} ${item.display} — Price: 🪙 ${await addCommas(item.price)}`, `\`${item.id}\` — ${item.description}`)
      }
      await interaction.reply({ embeds: [embed] })
    }
  }
}

module.exports = ShopCommand