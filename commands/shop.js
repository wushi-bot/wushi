import discord from 'discord.js'
import Command from '../models/Command'
import tools from '../resources/items/tools.json'
import foods from '../resources/items/foods.json'
import upgrades from '../resources/items/upgrades.json'
import collectables from '../resources/items/collectables.json'
import utils from '../utils/utils'

class Shop extends Command {
  constructor (client) {
    super(client, {
      name: 'shop',
      description: 'See the store.',
      category: 'Economy',
      aliases: ['store'],
      usage: 'shop [page]',
      cooldown: 0
    })
  }

  async run (bot, msg, args) {
    if (!args[0]) {
      const embed = new discord.MessageEmbed()
        .setColor('#77e86b')
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setDescription(':convenience_store: **Welcome to the Store** | What can I do for you?\n\n:poultry_leg: **Food** → Can be consumable for stat boosts & other effects.\n:tools: **Tools** → The main way to get income with this bot.\n:up: **Upgrades** → Makes the game more easier to play & is permanent and stackable.\n:flower_playing_cards: **Collectables** → Fun little collectables that serve no purpose or meaning.\n\nDo `.shop <category>`, for example, `.shop food` to see the corresponding catalog of items.')
      msg.channel.send(embed)
    }
    if (args[0] === 'tools' || args[0] === 'Tools') {
      const embed = new discord.MessageEmbed()
        .setColor('#77e86b')
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setDescription(':tools: **Tools** | The tools catalog.')
      tools.forEach(tool => {
        embed.addField(`${tool.emoji} ${tool.display}`, `ID: \`${tool.id}\` | Price: **$${utils.addCommas(tool.price)}** | ${tool.description.replace('[PRE]', utils.getPrefix(msg.guild.id))}`)
      })
      msg.channel.send(embed)
    } else if (args[0] === 'food' || args[0] === 'Food') {
      const embed = new discord.MessageEmbed()
        .setColor('#77e86b')
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setDescription(':poultry_leg: **Food** | The food catalog.')
      foods.forEach(food => {
        embed.addField(`${food.emoji} ${food.display}`, `ID: \`${food.id}\` | Price: **$${utils.addCommas(food.price)}** | ${food.description.replace('[PRE]', utils.getPrefix(msg.guild.id))}`)
      })
      msg.channel.send(embed)
    } else if (args[0] === 'upgrades' || args[0] === 'Upgrades') {
      const embed = new discord.MessageEmbed()
        .setColor('#77e86b')
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setDescription(':up: **Upgrades** | The upgrades catalog.')
      upgrades.forEach(upgrade => {
        embed.addField(`${upgrade.emoji} ${upgrade.display}`, `ID: \`${upgrade.id}\` | Price: **$${utils.addCommas(upgrade.price)}** | ${upgrade.description.replace('[PRE]', utils.getPrefix(msg.guild.id))}`)
      })
      msg.channel.send(embed)
    } else if (args[0] === 'collectables' || args[0] === 'Collectables') {
      const embed = new discord.MessageEmbed()
        .setColor('#77e86b')
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setDescription(':flower_playing_cards: **Collectables** | The collectables catalog.')
      collectables.forEach(collectable => {
        embed.addField(`${collectable.emoji} ${collectable.display}`, `ID: \`${collectable.id}\` | Price: **$${utils.addCommas(collectable.price)}** | ${collectable.description.replace('[PRE]', utils.getPrefix(msg.guild.id))}`)
      })
      msg.channel.send(embed)
    }
  }
}

module.exports = Shop
