
import { MessageEmbed } from 'discord.js'
import Command from '../../structs/command'
import key from '../../resources/key.json'
import utils from '../../utils/utils'
import db from 'quick.db'

const cfg = new db.table('config')

class HelpCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'help',
      description: 'Grabs a list of one or all commands.',
      aliases: ['h'],
      category: 'Meta',
      usage: 'help [command]',
      cooldown: 2
    })
  }

  async run (bot, msg, args) {
    if (!args[0]) {
      const embed = new MessageEmbed()
        .setColor(msg.member.roles.highest.color)
        .addField('<:info:820704940682510449> Support Server', 'Need help with [wushi](https://www.youtube.com/watch?v=HjlrejIg4Vg)? Join our [support server](https://discord.gg/zjqeYbNU5F)!')
      const commandsList = this.client.commands
      const categories = []
      const commandsInCategory = []
      commandsList.forEach(command => {
        const category = command.conf.category
        if (!categories.includes(category)) {
          const disabled = cfg.get(`${msg.guild.id}.disabled`) || []
          if (!disabled.includes(category)) categories.push(category)
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
        embed.addField(`${key[category]} ${category}`, `\`${utils.getPrefix(msg.guild.id)}${commandsInCategory[category].join(`\`, \`${utils.getPrefix(msg.guild.id)}`)}\``)
      })
      return msg.reply(embed)
    } else {
      const embed = new MessageEmbed()
      let command = args[0]
      if (this.client.commands.has(command) || this.client.aliases.has(command)) {
        command = this.client.commands.get(command)
        if (!command) {
          let c = this.client.aliases.get(args[0])
          command = this.client.commands.get(c)
        }
        let aliases = command.conf.aliases.toString().replace(/[|]/gi, ' ').replace(/,/gi, ', ')
        if (!aliases) aliases = 'None'
        else aliases = command.conf.aliases.toString().replace(/[|]/gi, ' ').replace(/,/gi, ', ')
        embed
          .setColor(msg.member.roles.highest.color)
          .addField('Command', `\`${command.conf.name}\``)
          .addField('Description', command.conf.description)
          .addField('Usage', `\`${utils.getPrefix(msg.guild.id)}${command.conf.usage}\``)
          .addField('Category', `${key[command.conf.category]} **${command.conf.category}**`)
          .addField('Aliases', aliases)
        msg.reply(embed)
      }
    }
  }
}

module.exports = HelpCommand