import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js-light'

import db from 'quick.db'
const cfg = new db.table('config')

import tools from '../../resources/items/tools.json'
import upgrades from '../../resources/items/upgrades.json'
import petstuff from '../../resources/items/petstuff.json'
import utils from '../../utils/utils'

class ShopCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'shop',
      description: 'See currently available items on the store.',
      category: 'Economy',
      aliases: ['store'],
      usage: 'shop',
      cooldown: 3.5
    })
  }

  async run (bot, msg, args) {
    const color = cfg.get(`${msg.author.id}.color`) || msg.member.roles.highest.color
    if (!args[0]) {
      const embed = new MessageEmbed()
        .addField(':tools: Tools', `\`${utils.getPrefix(msg.guild.id)}shop tools\` | See the catalog for the tools in your server.`)
        .addField(':up: Upgrades', `\`${utils.getPrefix(msg.guild.id)}shop upgrades\` | See the catalog for the upgrades for tools in your server.`)
        .addField(':dog: Pet Stuff', `\`${utils.getPrefix(msg.guild.id)}shop pets\` | See the catalog for pet stuff.`)
        .setColor(color)
      msg.reply(embed)
    } else if (args[0].toLowerCase() === 'tools') {
      if (!args[1]) {
        const embed = new MessageEmbed()
          .setColor(color)
          .setTitle(':tools: **Tools**')
          .setDescription(`The tools catalog, buy tools using \`${utils.getPrefix(msg.guild.id)}buy <id>\`.`)
          .setFooter(`To go to the next page, send ${utils.getPrefix(msg.guild.id)}shop tools 2`)
        for (let int = 0; int < 3; int++) {
          embed.addField(`${tools[int].emoji} ${tools[int].display}`, `ID: \`${tools[int].id}\` | Price: **:coin: ${utils.addCommas(tools[int].price)}** | ${tools[int].description.replace('[PRE]', utils.getPrefix(msg.guild.id))}`)
        }
        msg.reply(embed)
      } else if (args[1] === '2') {
        const embed = new MessageEmbed()
          .setColor(color)
          .setTitle(':tools: **Tools** (page 2)')
          .setDescription(`The tools catalog, buy tools using \`${utils.getPrefix(msg.guild.id)}buy <id>\`.`)
          .setFooter(`To go to the next page, send ${utils.getPrefix(msg.guild.id)}shop tools 3`)
        for (let int = 3; int < 6; int++) {
          embed.addField(`${tools[int].emoji} ${tools[int].display}`, `ID: \`${tools[int].id}\` | Price: **:coin: ${utils.addCommas(tools[int].price)}** | ${tools[int].description.replace('[PRE]', utils.getPrefix(msg.guild.id))}`)
        }
        msg.reply(embed)
      } else if (args[1] === '3') {
        const embed = new MessageEmbed()
          .setColor(color)
          .setTitle(':tools: **Tools** (page 3)')
          .setDescription(`The tools catalog, buy tools using \`${utils.getPrefix(msg.guild.id)}buy <id>\`.`)
          .setFooter(`To go to the next page, send ${utils.getPrefix(msg.guild.id)}shop tools 4`)
        for (let int = 6; int < 9; int++) {
          embed.addField(`${tools[int].emoji} ${tools[int].display}`, `ID: \`${tools[int].id}\` | Price: **:coin: ${utils.addCommas(tools[int].price)}** | ${tools[int].description.replace('[PRE]', utils.getPrefix(msg.guild.id))}`)
        }
        msg.reply(embed)
      } else if (args[1] === '4') {
        const embed = new MessageEmbed()
          .setColor(color)
          .setTitle(':tools: **Tools** (page 4)')
          .setDescription(`The tools catalog, buy tools using \`${utils.getPrefix(msg.guild.id)}buy <id>\`.`)
        for (let int = 9; int < 12; int++) {
          embed.addField(`${tools[int].emoji} ${tools[int].display}`, `ID: \`${tools[int].id}\` | Price: **:coin: ${utils.addCommas(tools[int].price)}** | ${tools[int].description.replace('[PRE]', utils.getPrefix(msg.guild.id))}`)
        }
        msg.reply(embed)
      }
    } else if (args[0].toLowerCase() === 'upgrades') {
      const embed = new MessageEmbed()
        .setColor(color)
        .setTitle(':up: **Upgrades**')
        .setDescription(`The upgrades catalog, buy upgrades for tools using \`${utils.getPrefix(msg.guild.id)}buy <id>\`.`)
      upgrades.forEach(upgrade => {
        embed.addField(`${upgrade.emoji} ${upgrade.display}`, `ID: \`${upgrade.id}\` | Price: **:coin: ${utils.addCommas(upgrade.price)}** | ${upgrade.description.replace('[PRE]', utils.getPrefix(msg.guild.id))}`)
      })
      msg.reply(embed)
    } else if (args[0].toLowerCase() === 'pets') {
      const embed = new MessageEmbed()
        .setColor(color)
        .setTitle(':dog: **Pet Stuff**')
        .setDescription(`The pet stuff catalog, buy stuff for your pets using \`${utils.getPrefix(msg.guild.id)}buy <id>\`.`)
        petstuff.forEach(stuff => {
        embed.addField(`${stuff.emoji} ${stuff.display}`, `ID: \`${stuff.id}\` | Price: **:coin: ${utils.addCommas(stuff.price)}** | ${stuff.description.replace('[PRE]', utils.getPrefix(msg.guild.id))}`)
      })
      msg.reply(embed)
    }
  }
}

module.exports = ShopCommand