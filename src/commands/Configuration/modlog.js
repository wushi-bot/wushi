import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js'
import db from 'quick.db'
const cfg = new db.table('config') 

class ModLogCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'mod-log',
      description: 'Sets the mod log channel in your server.',
      category: 'Configuration',
      aliases: ['ml', 'modlog'],
      usage: 'mod-log <#channel>',
      cooldown: 2.5
    })
  }

  async run (bot, msg, args) {
    const admins = cfg.get(`${msg.guild.id}.admins`) || []
    if (!msg.member.roles.cache.some(role => admins.includes(role.id)) && !msg.member.permissions.has('ADMINISTRATOR') && !msg.member.permissions.has('MANAGE_GUILD')) {
      return this.client.emit('customError', 'You do not have permission to execute this command.', msg)
    }
    if (!args[0]) {
      if (!cfg.get(`${msg.guild.id}.modLog`)) {
        const embed = new MessageEmbed()
          .setColor(msg.member.roles.highest.color)
          .addField('<:info:820704940682510449> Mod-log Channel', `There is currently no configured mod-log channel for this server.`)
        msg.reply(embed)
      } else {
        const embed = new MessageEmbed()
          .setColor(msg.member.roles.highest.color)
          .addField('<:info:820704940682510449> Mod-log Channel', `[wushi](https://www.youtube.com/watch?v=xTmj_CqUZls) will send moderation cases to <#${cfg.get(`${msg.guild.id}.modLog`)}>.`)
        msg.reply(embed)
      }
    } else {
      if (!msg.mentions.channels.first()) {
        const embed = new MessageEmbed()
          .setColor(msg.member.roles.highest.color)
          .addField('<:role:821012711403683841> Channel not found', 'You haven\'t inserted a valid channel.')
        msg.reply(embed)
      } else {
        const channel = msg.mentions.channels.first()
        try {
          const testEmbed = new MessageEmbed()
            .setTitle('Test message to see if wushi can use this channel')
          const testMessage = await channel.send(testEmbed)
          testMessage.delete()
          cfg.set(`${msg.guild.id}.modLog`, channel.id)
          const embed = new MessageEmbed()
            .setColor(msg.member.roles.highest.color)
            .addField('<:check:820704989282172960> Success!', `Successfully set the mod-log channel to <#${channel.id}>.`)
          msg.reply(embed)
        } catch (e) {
          console.log(e)
          const embed = new MessageEmbed()
            .setColor(msg.member.roles.highest.color)
            .addField('<:channel_locked:821178111278317648> Channel locked', `[wushi](https://www.youtube.com/watch?v=xTmj_CqUZls) cannot access <#${channel.id}>, you may have to reconfigure the permissions for that channel for me.`)
          msg.reply(embed)
        }
      }
    }
  }
}

module.exports = ModLogCommand