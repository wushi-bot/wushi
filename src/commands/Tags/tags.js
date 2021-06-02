import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js-light'
import utils from '../../utils/utils'
 
import db from 'quick.db'
const cfg = new db.table('config')
const tags = new db.table('tags')

class TagsCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'tags',
      description: 'Main command for custom tags in your server.',
      category: 'Tags',
      aliases: ['t'],
      subcommands: ['create', 'edit', 'list', 'delete'],
      usage: 'tags',
      cooldown: 3.5
    })
  }

  async run (bot, msg, args) {
    const color = cfg.get(`${msg.author.id}.color`) || msg.member.roles.highest.color
    const admins = cfg.get(`${msg.guild.id}.admins`) || []
    const mods = cfg.get(`${msg.guild.id}.mods`) || []
    if (!msg.member.roles.cache.some(role => admins.includes(role.id)) && !msg.member.roles.cache.some(role => mods.includes(role.id)) && !msg.member.permissions.has('ADMINISTRATOR') && !msg.member.permissions.has('BAN_MEMBERS')) {
      return this.client.emit('customError', 'You do not have permission to execute this command.', msg)
    }
    if (!args[0]) {
      const prefix = utils.getPrefix(msg.guild.id)
      const embed = new MessageEmbed() 
        .addField(':label: Tags Help', `\`${prefix}tags create <name> <content>\` - Creates a tag with a name and trigger.\n\`${prefix}tags edit <name> <new content>\` - Edits an already existing tag with new content.\n\`${prefix}tags delete <name>\` - Deletes an already existing tag.\n\`${prefix}tags list\` - Sends a list of tags.`)
        .setColor(color)
      msg.reply(embed)
    } else if (args[0] === 'create') {
      if (!args[1] || !args[2]) return this.client.emit('customError', 'You need to provide arguments.', msg)
      if (tags.get(`${msg.guild.id}.${args[1]}`)) return this.client.emit('customError', 'This tag already exists.', msg)
      if (this.client.commands.has(args[1]) || this.client.aliases.has(args[1])) return this.client.emit('customError', 'This tag name is a pre-existing command on wushi, tags cannot be named after commands.', msg)
      let content = args.slice(2)
      content = content.join(' ')
      const name = args[1].toLowerCase()
      tags.set(`${msg.guild.id}.${name}`, { content: content, author: msg.author.id })
      const embed = new MessageEmbed()
        .addField('<:check:820704989282172960> Success!', `Successfully created the tag **${name}** with content \`${content}\`. `)
        .setColor(color)
      msg.reply(embed)
    } else if (args[0] === 'list') {
      const embed = new MessageEmbed()
        .setColor(color)
      const tagsList = tags.get(`${msg.guild.id}`)
      if (tagsList === {}) {
        embed.addField(':label: No tags found', 'You do not have any tags!')
      } else {
        for (var tag in tagsList) {
          embed.addField(`:label: ${tag}`, `Created by: <@!${tags.get(`${msg.guild.id}.${tag}.author`)}>, Content: \`${tags.get(`${msg.guild.id}.${tag}.content`)}\`.`)
        }
      }
      msg.reply(embed)
    } else if (args[0] === 'edit') {
      if (!args[1] || !args[2]) return this.client.emit('customError', 'You need to provide arguments.', msg)
      if (!tags.get(`${msg.guild.id}.${args[1]}`)) return this.client.emit('customError', 'This tag doesn\'t exist.', msg)
      let content = args.slice(2)
      content = content.join(' ')
      tags.set(`${msg.guild.id}.${args[1]}.content`, content)
      const embed = new MessageEmbed()
        .addField('<:check:820704989282172960> Success!', `Successfully edited the tag **${args[1]}** with the new content: \`${content}\`. `)
        .setColor(color)
      msg.reply(embed)
    } else if (args[0] === 'delete') {
      if (!args[1]) return this.client.emit('customError', 'You need to provide arguments.', msg)
      if (!tags.get(`${msg.guild.id}.${args[1]}`)) return this.client.emit('customError', 'This tag doesn\'t exist.', msg)
      tags.delete(`${msg.guild.id}.${args[1]}`)
      const embed = new MessageEmbed()
        .addField('<:check:820704989282172960> Success!', `Successfully deleted the tag **${args[1]}**.`)
        .setColor(color)
      msg.reply(embed)
    }
  }
}

module.exports = TagsCommand