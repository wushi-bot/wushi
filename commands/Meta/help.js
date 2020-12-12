import Command from '../../models/Command'
import discord from 'discord.js'
import key from '../../resources/emoji_key.json'
import utils from '../../utils/utils'
import db from 'quick.db'
const config = new db.table('config')

class HelpCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'help',
      description: 'Grabs a list of one or many commands.',
      aliases: ['commands', 'cmd', 'cmds', 'assistanceplzdoktor', 'h'],
      category: 'Meta',
      usage: 'help [command]',
      cooldown: 0
    })
  }

  async run (bot, msg, args) {
    const color = 0xadd8e6
    if (!args[0]) {
      const embed = new discord.MessageEmbed()
        .setColor(color)
        .setTitle(':sushi: wushi\'s commands')
        .setDescription(`Here's a list of all my commands. Missing something? It may be disabled, see your config using \`${utils.getPrefix(msg.guild.id)}config\`.  You may also get some help from the [documentation](https://docs.wushibot.xyz/) | Join the support server: https://discord.gg/zwmqwjrxR9 | made by **minota#0001**`)
        .setFooter(`Requested by ${msg.author.username}`, msg.author.avatarURL(), true)
      const commandsList = this.client.commands
      const categories = []
      const commandsInCategory = []
      commandsList.forEach(command => {
        const category = command.conf.category
        if (!categories.includes(category)) {
          if (!config.get(`${msg.guild.id}.disabled`).includes(category)) categories.push(category)
        }
      })
      commandsList.forEach(command => {
        if (commandsInCategory[command.conf.category] === undefined) {
          commandsInCategory[command.conf.category] = []
        }
        if (command.conf.enabled === true) {
          commandsInCategory[command.conf.category].push(command.conf.name)
        }
      })
      categories.forEach(category => {
        embed.addField(`${key[category]} ${category} Commands`, `\`${utils.getPrefix(msg.guild.id)}${commandsInCategory[category].join(`\`, \`${utils.getPrefix(msg.guild.id)}`)}\``)
      })
      embed.setFooter(`Requested by ${msg.author.username}`, msg.author.avatarURL(), true)
      msg.channel.send(embed)
    } else {
      const embed = new discord.MessageEmbed()
      let command = args[0]
      if (this.client.commands.has(command)) {
        command = this.client.commands.get(command)
        let aliases = command.conf.aliases.toString().replace(/[|]/gi, ' ').replace(/,/gi, ', ')
        if (!aliases) aliases = 'None'
        else aliases = command.conf.aliases.toString().replace(/[|]/gi, ' ').replace(/,/gi, ', ')
        embed.setDescription(`\`${utils.getPrefix(msg.guild.id)}${command.conf.name}\``)
          .setColor(color)
          .setFooter(`Requested by ${msg.author.username}`, msg.author.avatarURL(), true)
          .addField('Description', command.conf.description, true)
          .addField('Usage', `\`${command.conf.usage}\``, true)
          .addField('Category', command.conf.category, true)
          .addField('Aliases', aliases, true)
        msg.channel.send({ embed })
      } else {
        const commandsList = this.client.commands
        const categories = []
        const commandsInCategory = []
        commandsList.forEach(command => {
          const category = command.conf.category
          if (!categories.includes(category)) {
            if (!config.get(`${msg.guild.id}.disabled`).includes(category)) categories.push(category)
          }
        })
        if (categories.includes(args[0])) {
          commandsList.forEach(command => {
            if (commandsInCategory[command.conf.category] === undefined) {
              commandsInCategory[command.conf.category] = []
            }
            if (command.conf.enabled === true) {
              commandsInCategory[command.conf.category].push(command.conf.name)
            }
          })
          const cat = args[0]
          embed
            .addField(`${key[cat]} ${cat} Commands`, `\`${utils.getPrefix(msg.guild.id)}${commandsInCategory[cat].join(`\`, \`${utils.getPrefix(msg.guild.id)}`)}\``)
            .setColor(color)
            .setFooter(`Requested by ${msg.author.username}`, msg.author.avatarURL(), true)
          msg.channel.send(embed)
        }
      }
    }
  }
}

module.exports = HelpCommand
