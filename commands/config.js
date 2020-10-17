import discord from 'discord.js'
import db from 'quick.db'
import utils from '../utils/utils'
import Command from '../models/Command'
const config = new db.table('config')

class Config extends Command {
  constructor (client) {
    super(client, {
      name: 'config',
      description: 'See the config of your server.',
      aliases: ['configuration', 'cfg', 'c'],
      category: 'Config',
      usage: 'config',
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    const embed = new discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle(`:tools: ${msg.guild.name}'s Configuration`)
      .setDescription('This is the server\'s configuration.')
      .addField(':scroll: Prefix', `This is the prefix for your server, all commands must start with these character(s).\`\`\`${utils.getPrefix(msg.guild.id)}\`\`\``)

    if (config.get(`${msg.guild.id}.disabled`) === undefined || config.get(`${msg.guild.id}.disabled`).length === 0) {
      embed.addField(':newspaper: Disabled Modules', `These modules will not show up on \`${utils.getPrefix(msg.guild.id)}help\` & will not function. (Enable them using \`${utils.getPrefix(msg.guild.id)}toggle <module>\`) \`\`\`None\`\`\``)
    } else {
      embed.addField(':newspaper: Disabled Modules', `These modules will not show up on \`${utils.getPrefix(msg.guild.id)}help\` & will not function. (Enable them using \`${utils.getPrefix(msg.guild.id)}toggle <module>\`) \`\`\`${config.get(`${msg.guild.id}.disabled`).join(', ')}\`\`\``)
    }
    msg.channel.send(embed)
  }
}

module.exports = Config
