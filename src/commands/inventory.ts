import { CommandInteraction, Guild, MessageActionRow, MessageButton, MessageEmbed, User } from 'discord.js'
import { getUser } from '../utils/database'
import { getItem } from '../utils/shop'

import Bot from '../models/Client'
import Command from '../models/Command'

function truncate( str, n, useWordBoundary ){
  if (str.length <= n) { return str; }
  const subString = str.substr(0, n-1); // the original check
  return (useWordBoundary 
    ? subString.substr(0, subString.lastIndexOf(" ")) 
    : subString) + "...";
}

class InventoryCommand extends Command {
  constructor() {
    super(
      'inventory', 
      'View your inventory.'
    )
  }

  async awaitControl(message, embed: MessageEmbed, filter: any, page: any, maxPages: any, user: User, guild: Guild) {
    let profile = await getUser(user.id)
    const items = profile.items || {}
    const keys = Object.keys(items)
    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setStyle('SECONDARY')
          .setEmoji('⬅️')
          .setCustomId('previous'),
        new MessageButton()
          .setStyle('SECONDARY')
          .setEmoji('➡️')
          .setCustomId('next')
      )
    message.awaitMessageComponent({ filter: filter, time: 30000 })
      .then(async i => {
        if (i.customId === 'previous') {
          if (page !== 1) {
            page--
            embed = new MessageEmbed()
              .setColor('#303136')
              .setAuthor(`${user.username}'s Inventory`, user.avatarURL())
              .setFooter(`Page ${page} of ${maxPages}`)
            for (let n = 0; n < 9; n++) {
              const i = await getItem(keys[n + (9 * (page - 1))])
              if (i) embed.addField(`${i.emoji} ${i.display} — ${items[i.id]}`, `ID: \`${i.id}\` | ${truncate(i.description, 50, '...')}`, true)
            }
            i.update({ embeds: [embed], components: [row] })
            this.awaitControl(message, embed, filter, page, maxPages, user, guild)
          } else {
            this.awaitControl(message, embed, filter, page, maxPages, user, guild)
          }
        } else if (i.customId === 'next') {
          if (page !== maxPages) {
            page++
            embed = new MessageEmbed()
              .setColor('#303136')
              .setAuthor(`${user.username}'s Inventory`, user.avatarURL())
              .setFooter(`Page ${page} of ${maxPages}`)
            for (let n = 0; n < 9; n++) {
              const i = await getItem(keys[n + (9 * (page - 1))])
              if (i) embed.addField(`${i.emoji} ${i.display} — ${items[i.id]}`, `ID: \`${i.id}\` | | ${truncate(i.description, 50, '...')}`, true)
            }
            i.update({ embeds: [embed], components: [row] })
            this.awaitControl(message, embed, filter, page, maxPages, user, guild)
          } else {
            this.awaitControl(message, embed, filter, page, maxPages, user, guild)
          }
        }
      })
      .catch(() => {
        message.edit({ embeds: [embed], components: [] })
      })
  }  

  async execute(interaction: CommandInteraction, client: Bot) {
    let user = await getUser(interaction.member.user.id)
    let items = user.items || {}
    if (items === {}) return await interaction.reply({ content: `Your inventory is empty, come back when you have some items!`, ephemeral: true }) 
    const embed = new MessageEmbed()
      .setColor('#303136') // @ts-ignore
      .setAuthor(`${interaction.member.user.username}'s Inventory`, interaction.user.avatarURL())
    let page = 1
    const keys = Object.keys(items)
    let maxPages = Math.ceil(keys.length / 9)
    embed.setFooter(`Page 1 of ${Math.ceil(keys.length / 9)}`)
    let n = 0
    for await (let item of keys) {
      if (n !== 9) {
        const i = await getItem(item)
        embed.addField(`${i.emoji} ${i.display} — ${items[item]}`, `ID: \`${i.id}\` | ${truncate(i.description, 50, '...')}`, true)
        n++
      }
    }
    let previousButton = new MessageButton()
      .setStyle('SECONDARY')
      .setEmoji('⬅️')
      .setCustomId('previous')
    if (page === 1) {
      previousButton.setDisabled(true)
    }
    let nextButton = new MessageButton()
      .setStyle('SECONDARY')
      .setEmoji('➡️')
      .setCustomId('next')
    if (page === 1 && maxPages === 1) {
      nextButton.setDisabled(true)
    }
    const row = new MessageActionRow()
      .addComponents(
        previousButton,
        nextButton
      )
    await interaction.reply({ embeds: [embed], components: [row] })
    const message = await interaction.fetchReply()
    const filter = i => {
      if (i.user.id !== interaction.member.user.id) return false
      if (i.customID === 'next' || i.customID === 'previous') return true
    }
    this.awaitControl(message, embed, filter, page, maxPages, interaction.user, interaction.guild)
  }
}

module.exports = InventoryCommand