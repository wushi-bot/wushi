import Command from '../../classes/Command'
import { addCommas, getItem, allItems, getPrefix } from '../../utils/utils'
import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js'
import db from 'quick.db'

const eco = new db.table('economy') 
const cfg = new db.table('config')

function truncate( str, n, useWordBoundary ){
    if (str.length <= n) { return str; }
    const subString = str.substr(0, n-1); // the original check
    return (useWordBoundary 
      ? subString.substr(0, subString.lastIndexOf(" ")) 
      : subString) + "...";
  }

class InventoryCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'inventory',
      description: 'Inventory',
      category: 'Economy',
      aliases: ['inv'],
      usage: 'inventory [@profile]',
      cooldown: 10
    })
  }

  async awaitControl(message, embed, filter, page, maxPages, user, guild) {
    const color = cfg.get(`${user.user.id}.color`) || user.roles.highest.color
    const items = eco.get(`${user.user.id}.items`) || {}
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
    message.awaitMessageComponentInteraction(filter, { time: 30000 })
      .then(async i => {
        if (i.customID === 'previous') {
          if (page !== 1) {
            page--
            embed = new MessageEmbed()
              .setColor(color)
              .setAuthor(`${user.user.username}'s Inventory`, user.user.avatarURL())
              .setFooter(`Page ${page} of ${maxPages}`)
            for (let n = 0; n < 9; n++) {
              const i = getItem(allItems(), keys[n + (9 * (page - 1))])
              if (i) embed.addField(`${i.emoji} ${i.display} — ${items[i.id]}`, `ID: \`${i.id}\` | Sell price: :coin: **${addCommas(Math.floor(i.sell_price))}** | ${truncate(i.description.replace('[PRE]', getPrefix(guild.id)), 50, '...')}`, true)
            }
            i.update({ embeds: [embed], components: [row] })
            this.awaitControl(message, embed, filter, page, maxPages, user, guild)
          } else {
            this.awaitControl(message, embed, filter, page, maxPages, user, guild)
          }
        } else if (i.customID === 'next') {
          if (page !== maxPages) {
            page++
            embed = new MessageEmbed()
              .setColor(color)
              .setAuthor(`${user.user.username}'s Inventory`, user.user.avatarURL())
              .setFooter(`Page ${page} of ${maxPages}`)
            for (let n = 0; n < 9; n++) {
              const i = getItem(allItems(), keys[n + (9 * (page - 1))])
              if (i) embed.addField(`${i.emoji} ${i.display} — ${items[i.id]}`, `ID: \`${i.id}\` | Sell price: :coin: **${addCommas(Math.floor(i.sell_price))}** | ${truncate(i.description.replace('[PRE]', getPrefix(guild.id)), 50, '...')}`, true)
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
  
  async run (bot, msg, args) {
    if (!eco.get(`${msg.author.id}.started`)) return this.client.emit('customError', 'You don\'t have a bank account!', msg)
    const color = cfg.get(`${msg.author.id}.color`) || msg.member.roles.highest.color
    const user = msg.guild.members.cache.get(args[0]) || msg.mentions.members.first() || msg.member 
    let embed = new MessageEmbed()
        .setColor(color)
        .setAuthor(`${user.user.username}'s Inventory`, user.user.avatarURL())
    let page = 1
    const items = eco.get(`${msg.author.id}.items`) || {}
    const keys = Object.keys(items)
    let maxPages = Math.ceil(keys.length / 9)
    embed.setFooter(`Page 1 of ${Math.ceil(keys.length / 9)}`)
    let n = 0
    keys.forEach(item => {
        if (n !== 9) {
          const i = getItem(allItems(), item)
          embed.addField(`${i.emoji} ${i.display} — ${items[item]}`, `ID: \`${i.id}\` | Sell price: :coin: **${addCommas(Math.floor(i.sell_price))}** | ${truncate(i.description.replace('[PRE]', getPrefix(msg.guild.id)), 50, '...')}`, true)
          n++
        }
    })
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
    const message = await msg.reply({ embeds: [embed], components: [row] })
    const filter = i => {
      if (i.user.id !== msg.author.id) return false
      if (i.customID === 'next' || i.customID === 'previous') return true
    }
    this.awaitControl(message, embed, filter, page, maxPages, user, msg.guild)
    return true
  }
}

module.exports = InventoryCommand