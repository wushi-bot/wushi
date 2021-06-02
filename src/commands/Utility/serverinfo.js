import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js-light'
import moment from 'moment' 

import db from 'quick.db'
const cfg = new db.table('config')

class ServerInfoCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'serverinfo',
      description: 'Gets the info for the server.',
      category: 'Utility',
      aliases: ['si', 'server'],
      usage: 'serverinfo',
      cooldown: 3.5
    })
  }

  async run (bot, msg, args) {
    const color = cfg.get(`${msg.author.id}.color`) || msg.member.roles.highest.color
    let roles = msg.guild.roles.cache.array().length
    let channels = msg.guild.channels.cache.array().length
    let emojis = msg.guild.emojis.cache.array().length
    let members = msg.guild.members.cache.array().length
    let createdAt = moment(msg.guild.createdAt).format('llll')
    const embed = new MessageEmbed()
      .setAuthor(`${msg.guild.name} (${msg.guild.id})`, msg.guild.iconURL())
      .setColor(color)
      .addField(':bust_in_silhouette: Owner', `<@!${msg.guild.ownerID}> (${msg.guild.ownerID})`, true)
      .addField(':scroll: Roles', `**${roles}** roles`, true)
      .addField(':tv: Channels', `**${channels}** channels`, true)
      .addField(':joy: Emojis', `**${emojis}** emojis`, true)
      .addField(':checkered_flag: Region', `**${msg.guild.region}**`, true)
      .addField(':calendar: Created at', `${createdAt}`, true)
      .addField(':busts_in_silhouette: Members', `**${members}** members`, true)
    if (msg.guild.iconURL()) embed.addField(':frame_photo: Icon URL', `[URL](${msg.guild.iconURL()})`, true)
    if (msg.guild.afkChannel) embed.addField(':zzz: AFK Channel', `${msg.guild.afkChannel.name}`, true)
    if (msg.guild.rulesChannel) embed.addField(':book: Rules Channel', `<#${msg.guild.rulesChannel.id}>`, true)
    if (msg.guild.premiumSubscriptionCount) embed.addField(':gem: Boosts', `**${msg.guild.premiumSubscriptionCount}** boosts`, true)
    if (msg.guild.bannerURL()) embed.setImage(msg.guild.bannerURL())
    msg.reply(embed)
  }
}

module.exports = ServerInfoCommand