import { MessageEmbed, MessageActionRow, MessageButton } from 'discord.js'
import Command from '../../classes/Command'
import Guild from '../../models/Guild'
import key from '../../resources/key.json'
import { getColor, getPrefix } from '../../utils/utils'
import { checkGuild } from '../../utils/database'

class HelpCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'help',
      description: 'Grabs a list of one or all commands.',
      aliases: ['h'],
      category: 'Meta',
      usage: 'help [command]',
      cooldown: 2.5
    })
  }

  async run (bot, msg, args) {
    const color = await getColor(bot, msg.member)
    checkGuild(msg.guild.id, bot)
    const guild = await Guild.findOne({
      id: msg.guild.id
    }).exec()
    const prefix = await getPrefix(msg.guild.id)
    if (!args[0]) {
      const embed = new MessageEmbed()
        .setColor(color) // @ts-ignore: Object is possibly 'null'.
        .setAuthor(`${this.client.user.username}'s Commands`, this.client.user.avatarURL()!!) // @ts-ignore: Object is possibly 'null'.
      const commandsList = this.client.commands 
      const categories = []
      const commandsInCategory = []
      commandsList.forEach(command => {
        const category = command.conf.category
        if (!categories.includes(category)) {
          const disabledModules = guild.disabledModules || []
          let check
          if (category === 'Admin' && msg.author.id !== '488786712206770196') check = false
          else check = true
          if (!disabledModules.includes(category) && check) categories.push(category)
        }
      })
      commandsList.forEach(command => {
        if (commandsInCategory[command.conf.category] === undefined) {
          commandsInCategory[command.conf.category] = []
        }
        const disabledCommands = guild.disabledCommands || []
        if (command.conf.enabled === true && !disabledCommands.includes(command.conf.name)) {
          if (command.conf.subcommands) {
            command.conf.subcommands.forEach(subcommand => {
              commandsInCategory[command.conf.category].push(`${command.conf.name} ${subcommand}`)
            })
          }
          commandsInCategory[command.conf.category].push(command.conf.name)
        }
      })
      categories.forEach(category => {
        embed.addField(`${key[category]} ${category} (${commandsInCategory[category].length})`, `\`${prefix}${commandsInCategory[category].join(`\`, \`${prefix}`)}\``)
      })
      const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setLabel('Invite')
          .setURL('https://wushibot.xyz/invite')
          .setStyle('LINK'),
        new MessageButton()
          .setLabel('Support')
          .setURL('https://wushibot.xyz/community')
          .setStyle('LINK'),
        new MessageButton()
          .setLabel('Commands')
          .setURL('https://wushibot.xyz/commands')
          .setStyle('LINK'), 
        new MessageButton()
          .setLabel('Donate')
          .setURL('https://ko-fi.com/minota')
          .setStyle('LINK'),                    
      )
      msg.reply({ embeds: [embed], components: [row] })
      return true
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
        else aliases = `\`${command.conf.aliases.toString().replace(/[|]/gi, ' ').replace(/,/gi, '`, `')}\``
        embed
          .setColor(color)
          .addField('Command', `\`${command.conf.name}\``)
          .addField('Description', command.conf.description)
          .addField('Usage', `\`${prefix}${command.conf.usage}\``)
          .addField('Category', `${key[command.conf.category]} **${command.conf.category}**`)
          .addField('Aliases',  aliases)
        if (command.conf.cooldown !== false) embed.addField('Cooldown', `**${command.conf.cooldown}s** (**${command.conf.cooldown / 2}s** for Premium users)`)
        msg.reply({ embeds: [embed] })
        return true
      } else {
        this.client.emit('customError', 'The provided command must be valid command/alias.', msg)
        return false
      }
    }
  }
}

module.exports = HelpCommand