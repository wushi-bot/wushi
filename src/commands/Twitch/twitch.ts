import Command from '../../classes/Command'
import { MessageEmbed } from 'discord.js'
import { getPrefix, removeA } from '../../utils/utils'
import db from 'quick.db'

const cfg = new db.table('config')
const twitchDb = new db.table('twitch')

class TwitchCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'twitch',
      description: 'Main command for stream alerts in your server.\n\nVariables: {message}, {username}, {game}, {language}, {url}, {title}, {started_at}',
      category: 'Twitch',
      aliases: ['twtch'],
      subcommands: ['add', 'channel', 'remove', 'message', 'list', 'config'],
      usage: 'twitch [subcommand]',
      cooldown: 3.5
    })
  }

  async run (bot, msg, args) {
    const color = cfg.get(`${msg.author.id}.color`) || msg.member.roles.highest.color
    const admins = cfg.get(`${msg.guild.id}.admins`) || []
    if (!msg.member.roles.cache.some(role => admins.includes(role.id)) && !msg.member.permissions.has('ADMINISTRATOR') && !msg.member.permissions.has('MANAGE_GUILD')) {
      this.client.emit('customError', 'You do not have permission to execute this command.', msg)
      return false
    }
    if (!args[0]) {
      const prefix = getPrefix(msg.guild.id)
      const embed = new MessageEmbed() 
        .addField(':movie_camera: Twitch Help', `\`${prefix}twitch add <name>\` - Adds a streamer to check if they're streaming.\n\`${prefix}twitch channel <name>\` - Sets the channel for twitch streams.\n\`${prefix}twitch remove <name>\` - Deletes an already existing twitch streamer.\n\`${prefix}twitch list\` - Sends a list of twitch streamer in the server.\n\`${prefix}twitch config\` - Sends the twitch config for your server.`)
        .setColor(color)
      msg.reply({ embeds: [embed] })
      return true
    } else if (args[0] === 'add') {
        if (!args[1]) { 
            this.client.emit('customError', 'You need to provide a streamer to add.', msg)
            return false
        }
        twitchDb.push(`${msg.guild.id}.users`, args[1])
        const embed = new MessageEmbed()
            .setColor(color)
            .addField('<:check:820704989282172960> Success!', `Successfully added \`${args[1]}\` to the streamer list.`)
        msg.reply({ embeds: [embed] })
    } else if (args[0] === 'list') {
        const embed = new MessageEmbed()
            .setColor(color)
            .addField(':movie_camera: Twitch Streamers', `\`${twitchDb.get(`${msg.guild.id}.users`).join('`, `')}\``)
        msg.reply({ embeds: [embed] }) 
    } else if (args[0] === 'remove') {
        if (!args[1]) { 
            this.client.emit('customError', 'You need to provide a streamer to remove.', msg)
            return false
        }
        const list = twitchDb.get(`${msg.guild.id}.users`) || []
        if (!list.includes(args[1])) {
            this.client.emit('customError', 'You need to provide a *valid* streamer to remove.', msg)
            return false
        } // @ts-ignore
        const i = removeA(list, args[1])
        twitchDb.set(`${msg.guild.id}.users`, i)
    } else if (args[0] === 'channel') {
        if (!args[1]) { 
            this.client.emit('customError', 'You need to provide a channel to set.', msg)
            return false
        } 
        if (!msg.mentions.channels.first()) {
            this.client.emit('customError', 'You need to provide a *valid* channel to set.', msg)
            return false
        }
        const channel = msg.mentions.channels.first()
        twitchDb.set(`${msg.guild.id}.channel`, channel.id)
        const embed = new MessageEmbed()
            .setColor(color)
            .addField('<:check:820704989282172960> Success!', `Successfully set the twitch channel to <#${channel.id}>.`)
            .setFooter('If twitch streams do not send, please check if wushi has permissions to send messages.')
        msg.reply({ embeds: [embed] })
    } else if (args[0] === 'message') {
        if (!args[1]) { 
            this.client.emit('customError', 'You need to provide a message to set.', msg)
            return false
        } 
        let message = args.shift()
        message = args.join(' ')
        twitchDb.set(`${msg.guild.id}.message`, message)
        message = message.replace('`', '\`')
        const embed = new MessageEmbed()
            .setColor(color)
            .addField('<:check:820704989282172960> Success!', `Successfully set the message to \`${message}\`.`)
            .setFooter('Check variables using the help command on this command..')
        msg.reply({ embeds: [embed] })        
    } else if (args[0] === 'config') {
        const users = twitchDb.get(`${msg.guild.id}.users`) || []
        const message = twitchDb.get(`${msg.guild.id}.message`) || 'Not set yet'
        const embed = new MessageEmbed()
            .setColor(color)
            .setTitle(':movie_camera: Twitch Config')
        if (users.length === 0) embed.addField(`:busts_in_silhouette: Users`, 'None yet.')
        else embed.addField(':busts_in_silhouette: Users', `\`${users.join('`, `')}\``)
        embed.addField(':speech_left: Message', `\`${message}\``)
        embed.addField('<:channel:821178111184863272> Channel', `<#${twitchDb.get(`${msg.guild.id}.channel`)}>`)
        msg.reply({ embeds: [embed] })     
    }
    return true
  }
}

module.exports = TwitchCommand