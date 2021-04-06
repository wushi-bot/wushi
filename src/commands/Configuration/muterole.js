import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js'
 
import db from 'quick.db'
const cfg = new db.table('config')

class MuteRoleCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'muterole',
      description: 'Creates the mute role for your server.',
      category: 'Configuration',
      aliases: ['mr'],
      usage: 'muterole [create|role id/mention]',
      cooldown: 3.5
    })
  }

  async run (bot, msg, args) {
    const admins = cfg.get(`${msg.guild.id}.admins`) || []
    if (!msg.member.roles.cache.some(role => admins.includes(role.id)) && !msg.member.permissions.has('ADMINISTRATOR') && !msg.member.permissions.has('MANAGE_GUILD')) {
      return this.client.emit('customError', 'You do not have permission to execute this command.', msg)
    }
    if (args[0] === 'create') {
      try {
        const mutedRole = await msg.guild.roles.create({
          name: 'Muted',
          color: 'RED',
          reason: 'Setting up Muted role.'
        })
        const channels = msg.guild.channels.cache.array()
        channels.forEach(channel => {
          if (channel.type === 'text') {
            channel.updateOverwrite(mutedRole, {
              SEND_MESSAGES: false
            })
          }
        })
        cfg.set(`${msg.guild.id}.mutedRole`, mutedRole.id)
        const embed = new MessageEmbed()
          .setColor(msg.member.roles.highest.color)
          .addField('<:check:820704989282172960> Success!', `Successfully set your mute role to <@&${mutedRole.id}>.`)
        msg.reply(embed)
      } catch (e) {
        return this.client.emit('customError', '**wushi** probably lacks permission to configure the muted role, please configure the server so that I can create the **Muted** role & lock sending messages.')
      }
    } else { 
      const role = msg.guild.members.cache.get(args[0]) || msg.mentions.roles.first() 
      if (!role) {
        return this.client.emit('customError', 'You just inserted an invalid role.', msg)
      }
      cfg.set(`${msg.guild.id}.mutedRole`, role.id)
      const embed = new MessageEmbed()
        .setColor(msg.member.roles.highest.color)
        .addField('<:check:820704989282172960> Success!', `Successfully set your mute role to <@&${role.id}>.`)
      msg.reply(embed)
    }
  }
}

module.exports = MuteRoleCommand