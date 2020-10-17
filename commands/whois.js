import Command from '../models/Command'
import { MessageEmbed } from 'discord.js'
import moment from 'moment'

function getJoinRank (ID, guild) { // Call it with the ID of the user and the guild
  if (!guild.member(ID)) return // It will return undefined if the ID is not valid

  const arr = guild.members.cache.array() // Create an array with every member
  arr.sort((a, b) => a.joinedAt - b.joinedAt) // Sort them by join date

  for (let i = 0; i < arr.length; i++) { // Loop though every element
    if (arr[i].id === ID) return i // When you find the user, return it's position
  }
}

class WhoIsCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'whois',
      description: 'Gets information about a user.',
      category: 'Util',
      aliases: ['who-is', 'user-info', 'userinfo', 'user'],
      usage: 'whois [user]',
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    const user = msg.guild.members.cache.get(args[0]) || msg.mentions.members.first() || msg.member
    if (!user) {
      const embed = new MessageEmbed()
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setDescription('<:WrongMark:767062695618543617> Please insert a valid user.')
        .setColor('#ff2803')
      return msg.channel.send(embed)
    }
    const joinDiscord = moment(user.user.createdAt).format('llll')
    const joinServer = moment(user.joinedTimestamp).format('llll')
    let sf = ''
    switch (user.presence.status) {
      case 'online':
        sf = '<:status_online:767072323349250070> **Online**'
        break
      case 'idle':
        sf = '<:status_idle:767072442488455209> **Idle**'
        break
      case 'dnd':
        sf = '<:status_dnd:767072442832912444> **Do not Disturb**'
        break
      case 'offline':
        sf = '<:status_offline:767072323584917544> **Offline**'
        break
      default:
        break
    }
    const statusFormat = sf
    const embed = new MessageEmbed()
      .setAuthor(`${user.user.username}#${user.user.discriminator}`, user.user.avatarURL())
      .setThumbnail(user.user.avatarURL())
      .setColor(user.roles.highest.color)
      .addField(`Roles (${user.roles.cache.size})`, user.roles.cache.map(r => `${r}`).join(', '), true)
      .addField('Join Position', getJoinRank(user.id, msg.guild), true)
      .addField('Joined Discord at', joinDiscord, true)
      .addField('Joined Server at', joinServer, true)
      .addField('Status', statusFormat)
      .setFooter(`ID: ${user.user.id} | Avatar ID: ${user.user.avatar}`)
      .addField('Avatar', `[\`png\`](${user.user.avatarURL({ format: 'png' })}) | [\`jpg\`](${user.user.avatarURL({ format: 'jpg' })})  | [\`gif\`](${user.user.avatarURL({ format: 'gif' })}) | [\`webp\`](${user.user.avatarURL({ format: 'webp' })})`, true)
      .setTimestamp()
    return msg.channel.send(embed)
  }
}

module.exports = WhoIsCommand
