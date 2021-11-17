import { CommandInteraction, MessageActionRow, MessageEmbed, MessageSelectMenu } from 'discord.js'
import { getItems, getItem } from '../utils/shop'
import { getUser } from '../utils/database'

import Bot from '../models/Client'
import Command from '../models/Command'

class RodsCommand extends Command {
  constructor() {
    super(
      'rods', 
      'Select a rod to use for fishing.'
    )
  }

  async interactionLoop(message, embed, filter, u, interaction, row) {
    message.awaitMessageComponent({ filter: filter, time: 8000 })
      .then(async i => {
        let user = await getUser(u)
        user.fishing_rod = i.values[0]
        user.markModified('fishing_rod')
        user.save()
        let item = await getItem(i.values[0])
        let list = []
        let items = Object.keys(user.items)
        for await (let item of items) {
          let i = await getItem(item)
          if (i.type === 'rod') {
            if (!list.includes(i.id)) list.push(i.id)
          }
        }
        let list2 = []
        let list_display = []
        for (let item of list) {
          let i = await getItem(item)
          let active
          if (user.fishing_rod) {
            active = await getItem(user.fishing_rod)
          }
          if (active && active.id === i.id) {
            list_display.push(`<:check:820704989282172960> ${i.emoji} **${i.display}** — \`${i.id}\``)
          } else {
            list_display.push(`${i.emoji} **${i.display}** — \`${i.id}\``)
          }
          list2.push({
            label: i.display,
            description: i.description,
            emoji: i.emoji,
            value: i.id
          })
        }
        embed.setDescription(`${list_display.join('\n')}`)
        await interaction.editReply({ embeds: [embed], components: [row] })
        await interaction.followUp({ content: `Successfully set ${item.emoji} **${item.display}** as your active Fishing Rod.`, ephemeral: true })
        this.interactionLoop(message, embed, filter, u, interaction, row)
      })  
      .catch(e => {
        message.edit({ embeds: [embed], components: [] })
        return
      })
  }

  async execute(interaction: CommandInteraction, client: Bot) { 
    let user = await getUser(interaction.user.id)
    let list = []
    let items = Object.keys(user.items)
    for await (let item of items) {
      let i = await getItem(item)
      if (i.type === 'rod') {
        if (!list.includes(i.id)) list.push(i.id)
      }
    }
    let list2 = []
    let list_display = []
    for (let item of list) {
      let i = await getItem(item)
      let active
      if (user.fishing_rod) {
        active = await getItem(user.fishing_rod)
      }
      if (active && active.id === i.id) {
        list_display.push(`<:check:820704989282172960> ${i.emoji} **${i.display}** — \`${i.id}\``)
      } else {
        list_display.push(`${i.emoji} **${i.display}** — \`${i.id}\``)
      }
      list2.push({
        label: i.display,
        description: i.description,
        emoji: i.emoji,
        value: i.id
      })
    }
    const embed = new MessageEmbed()
      .setTitle(':fishing_pole_and_fish: Your Fishing Rods')
      .setDescription(`${list_display.join('\n')}`)
      .setColor('#303136')
    
    const menu = new MessageSelectMenu()
      .setCustomId('select-fishing-rod')
      .setPlaceholder('Nothing selected')
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions(list2)
    const row = new MessageActionRow()
      .addComponents(menu)
    await interaction.reply({ embeds: [embed], components: [row] })
    const message = await interaction.fetchReply()
    const filter = i => {
      if (i.user.id === interaction.member.user.id) return true
    }
    this.interactionLoop(message, embed, filter, interaction.user.id, interaction, row)
  }
}

module.exports = RodsCommand