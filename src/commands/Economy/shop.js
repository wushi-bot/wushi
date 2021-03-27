import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js'

import tools from '../../resources/items/tools.json'
import upgrades from '../../resources/items/upgrades.json'
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
    if (!args[0]) {
      const embed = new MessageEmbed()
        .addField(':tools: Tools', `\`${utils.getPrefix(msg.guild.id)}shop tools\` | See the catalog for the tools in your server.`)
        .addField(':up: Upgrades', `\`${utils.getPrefix(msg.guild.id)}shop upgrades\` | See the catalog for the upgrades for tools in your server.`)
        .setColor(msg.member.roles.highest.color)
      msg.reply(embed)
    } else if (args[0].toLowerCase() === 'tools') {
      const embed = new MessageEmbed()
        .setColor(msg.member.roles.highest.color)
        .setTitle(':tools: **Tools**')
        .setDescription(`The tools catalog, buy tools using \`${utils.getPrefix(msg.guild.id)}buy <id>\`.`)
      tools.forEach(tool => {
        embed.addField(`${tool.emoji} ${tool.display}`, `ID: \`${tool.id}\` | Price: **:coin: ${utils.addCommas(tool.price)}** | ${tool.description.replace('[PRE]', utils.getPrefix(msg.guild.id))}`)
      })
      msg.reply(embed)
    } else if (args[0].toLowerCase() === 'upgrades') {
      const embed = new MessageEmbed()
        .setColor(msg.member.roles.highest.color)
        .setTitle(':up: **Upgrades**')
        .setDescription(`The upgrades catalog, buy upgrades for tools using \`${utils.getPrefix(msg.guild.id)}buy <id>\`.`)
      upgrades.forEach(upgrade => {
        embed.addField(`${upgrade.emoji} ${upgrade.display}`, `ID: \`${upgrade.id}\` | Price: **:coin: ${utils.addCommas(upgrade.price)}** | ${upgrade.description.replace('[PRE]', utils.getPrefix(msg.guild.id))}`)
      })
      msg.reply(embed)
    }
  }
}

module.exports = ShopCommand