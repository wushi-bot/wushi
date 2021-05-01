import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js'
 
class MemberCountCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'membercount',
      description: 'Gets the member count of a server.',
      category: 'Utility',
      aliases: ['mc'],
      usage: 'membercount',
      cooldown: 5.5
    })
  }

  async run (bot, msg, args) {
    let online = msg.guild.members.cache.filter(member => member.user.presence.status === 'online')
    online = online.array().length
    let total = msg.guild.members.cache.array().length
    let bots = msg.guild.members.cache.filter(member => member.user.bot)
    bots = bots.array().length
    let humans = msg.guild.members.cache.filter(member => member.user.bot === false)
    humans = humans.array().length
    const embed = new MessageEmbed()
      .setColor(msg.member.roles.highest.color)
      .setTitle(`Member count for ${msg.guild.name}`)
      .addField(':busts_in_silhouette: Online', online, true)
      .addField(':compass: Total', total, true)
      .addField(':bust_in_silhouette: Humans', humans, true)
      .addField(':robot: Bots', bots, true)
    msg.reply(embed)
  }
}

module.exports = MemberCountCommand