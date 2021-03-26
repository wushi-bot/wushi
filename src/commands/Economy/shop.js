import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js'

import tools from '../../resources/items/tools.json'
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
        .setColor(msg.member.roles.highest.color)
      msg.reply(embed)
    } else if (args[0] === 'tools') {
      const embed = new MessageEmbed()
        .setColor(msg.member.roles.highest.color)
        .setTitle(':tools: **Tools**')
        .setDescription(`The tools catalog, buy tools using \`${utils.getPrefix(msg.guild.id)}buy <id>\`.`)
      tools.forEach(tool => {
        embed.addField(`${tool.emoji} ${tool.display}`, `ID: \`${tool.id}\` | Price: **:coin: ${utils.addCommas(tool.price)}** | ${tool.description.replace('[PRE]', utils.getPrefix(msg.guild.id))}`)
      })
      msg.reply(embed)
    }
  }
}

module.exports = ShopCommand