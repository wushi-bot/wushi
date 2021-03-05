import Command from '../../models/Command'
import discord, { MessageEmbed } from 'discord.js'
import key from '../../resources/emoji_key.json'
import utils from '../../utils/utils'
import db from 'quick.db'
const config = new db.table('config')

class HelpCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'help',
      description: 'Grabs a list of one or many commands.',
      aliases: ['cmd', 'cmds', 'assistanceplzdoktor', 'h'],
      category: 'Meta',
      usage: 'help [command]',
      cooldown: 0
    })
  }

  async run (bot, msg, args) {
    const color = 0xadd8e6
    if (!args[0]) {
      const prefix = utils.getPrefix(msg.guild.id)
      const embed = new discord.MessageEmbed()
        .setColor(color)
        .setTitle(':sushi: wushi\'s commands')
        .setFooter(`Requested by ${msg.author.username}`, msg.author.avatarURL(), true)
      const commandsList = this.client.commands
      const commandsInCategory = []
      const categories = []
      commandsList.forEach(command => {
        const category = command.conf.category
        if (!categories.includes(category)) {
          if (!config.get(`${msg.guild.id}.disabled`).includes(category)) categories.push(category)
        }
      })
      const list = []
      
      categories.forEach(category => {
        list.push(`${key[category]} **${utils.toTitleCase(category)}**`)
      })
      embed
        .setDescription(list.join('\n'))
      embed.setFooter(`Requested by ${msg.author.username} • Usage: ${utils.getPrefix(msg.guild.id)}help <category>`, msg.author.avatarURL(), true)
      msg.channel.send(embed)
    } else if (this.client.commands.has(args[0]) || this.client.aliases.has(args[0])) {
      const embed = new discord.MessageEmbed()
      let command = args[0]
      if (this.client.commands.has(command)) {
        command = this.client.commands.get(command)
        let aliases = command.conf.aliases.toString().replace(/[|]/gi, ' ').replace(/,/gi, ', ')
        if (!aliases) aliases = 'None'
        else aliases = command.conf.aliases.toString().replace(/[|]/gi, ' ').replace(/,/gi, ', ')
        embed
          .addField('Command', `\`${utils.getPrefix(msg.guild.id)}${command.conf.name}\``)
          .setColor(color)
          .setFooter(`Requested by ${msg.author.username}`, msg.author.avatarURL())
          .addField('Description', command.conf.description)
          .addField('Usage', `\`${command.conf.usage}\``)
          .addField('Category', `${key[command.conf.category]} **${command.conf.category}**`)
          .addField('Aliases', aliases)
        msg.channel.send({ embed })
      }
    } else {
      const commandsList = this.client.commands
      const categories = []
      const commandsInCategory = []
      const embed = new MessageEmbed()
      commandsList.forEach(command => {
        const category = command.conf.category
        if (!categories.includes(category)) {
          if (!config.get(`${msg.guild.id}.disabled`).includes(category) && category !== 'Admin') categories.push(category)
        }
      })
      let cata = args[0].toLowerCase()
      cata = utils.toTitleCase(cata)
      if (categories.includes(cata)) {
        commandsList.forEach(command => {
          if (commandsInCategory[command.conf.category] === undefined) {
            commandsInCategory[command.conf.category] = []
          }
          if (command.conf.enabled === true) {
            commandsInCategory[command.conf.category].push(command.conf.name)
          }
        })
        const cat = cata
        embed
          .addField(`${key[cat]} ${cat} Commands`, `These are the list of commands for **${key[cat]} ${cat}**.\n──────────────────────\n\`${utils.getPrefix(msg.guild.id)}${commandsInCategory[cat].join(`\`, \`${utils.getPrefix(msg.guild.id)}`)}\``)
          .setColor(color)
          .setFooter(`Requested by ${msg.author.username}`, msg.author.avatarURL(), true)
        msg.channel.send(embed)
      }
    }
  }
}

module.exports = HelpCommand
