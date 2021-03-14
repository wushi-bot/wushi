import { MessageEmbed } from 'discord.js'
import Command from '../../structs/command'
import utils from '../../utils/utils'

class PrefixCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'prefix',
      description: 'Sets the prefix for the bot in your server.',
      aliases: ['p', 'pre'], 
      cooldown: 4.5,
      category: 'Configuration',
      usage: 'prefix <text>'
    })
  }

  async run (bot, msg, args) {
    const embed = new MessageEmbed()
      .setColor(msg.member.roles.highest.color)
      .setTitle(`<:info:820704940682510449> ${msg.guild.name}'s Configuration`)
      .addField('<:slash:820751995824504913> Prefix', `The prefix for this server is \`${utils.getPrefix(msg.guild.id)}\``)
      
    msg.reply(embed)
  }
}

module.exports = PrefixCommand