import { MessageEmbed } from 'discord.js'
import Command from '../../classes/Command'
import { getColor } from '../../utils/utils'
import { checkGuild } from '../../utils/database'
import Guild from '../../models/Guild'

class PrefixCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'prefix',
      description: 'Sets the prefix for the bot in your server.',
      aliases: ['pre'], 
      cooldown: 4.5,
      category: 'Configuration',
      usage: 'prefix <text>'
    })
  }

  async run (bot, msg, args) {
    //TODO: Create admin permissions setup via wushi.
    const color = await getColor(bot, msg.member)
    checkGuild(bot, msg.guild.id)
    const guild = await Guild.findOne({
      id: msg.guild.id
    }).exec() // @ts-ignore
    const admins = guild.admins || []


    if (!msg.member.roles.cache.some(role => admins.includes(role.id)) && !msg.member.permissions.has('ADMINISTRATOR') && !msg.member.permissions.has('MANAGE_GUILD')) {
      this.client.emit('customError', 'You do not have permission to execute this command.', msg)
      return false
    }
    if (!args[0]) {
      this.client.emit('customError', 'You need to assign a new prefix!', msg)
      return false
    } else {
      guild.prefix = args[0]
      guild.save()
      const embed = new MessageEmbed()
        .addField('<:check:820704989282172960> Success!', `The prefix for the server has successfully been changed to \`${args[0]}\`.`)
        .setColor(color)
      msg.reply({ embeds: [embed] })
      return true
    }
  }
}

module.exports = PrefixCommand