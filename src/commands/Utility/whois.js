import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js'
import moment from 'moment'

function getJoinRank (ID, guild) { // Call it with the ID of the user and the guild
  if (!guild.members.resolveID(ID)) return // It will return undefined if the ID is not valid

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
      category: 'Utility',
      aliases: ['who-is', 'user-info', 'userinfo', 'user'],
      usage: 'whois [user]',
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    const user = msg.guild.members.cache.get(args[0]) || msg.mentions.members.first() || msg.member
    if (!user) return this.client.emit('customError', 'Please insert a valid user.', msg)
    const joinDiscord = moment(user.user.createdAt).format('llll')
    const joinServer = moment(user.joinedTimestamp).format('llll')
    let sf = ''
    switch (user.presence.status) {
      case 'online':
        sf = '<:online:834964846021312552> **Online**'
        break
      case 'idle':
        sf = '<:idle:834964845790232596> **Idle**'
        break
      case 'dnd':
        sf = '<:dnd:834964845744750662> **Do not Disturb**'
        break
      case 'offline':
        sf = '<:offline:834964845823918090> **Offline**'
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
      .addField('Status', statusFormat, true)
      .setFooter(`ID: ${user.user.id} | Avatar ID: ${user.user.avatar}`)
      .addField('Avatar', `[\`png\`](${user.user.avatarURL({ format: 'png' })}) | [\`jpg\`](${user.user.avatarURL({ format: 'jpg' })})  | [\`gif\`](${user.user.avatarURL({ format: 'gif' })}) | [\`webp\`](${user.user.avatarURL({ format: 'webp' })})`, true)
    return msg.reply(embed)
  }
}

module.exports = WhoIsCommand