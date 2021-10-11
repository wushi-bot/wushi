import Command from '../../classes/Command'
import { MessageEmbed } from 'discord.js'
import { getColor } from '../../utils/utils'

import Member from '../../models/Member'

class LevelsCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'levels',
      description: 'Gets the top 10 highest EXP users in the server.',
      category: 'Leveling',
      aliases: [],
      usage: 'levels',
      cooldown: 5
    })
  }

  async run (bot, msg, args) {
    const color = await getColor(bot, msg.member)
    let list = []
    const members = await Member.find({
      guildId: msg.guild.id
    }).exec()
    members.forEach(async member => {
      list.push({ ID: member.userId, totalExp: member.totalExp})
    })
    list.sort(function (a, b) { return (b.totalExp) - (a.totalExp) })
    list = list.slice(0, 9)
    const embed = new MessageEmbed()
      .setColor(color)
      .setTitle(`🏆 Top 10 EXP users in this server.`)
    if (list.length === 0) embed.setDescription('There are no EXP profiles in this server.')
    let x = 1
    list.forEach(async i => {
      const user = this.client.users.cache.get(i.ID)
      const member = await Member.findOne({
        userId: i.ID,
        guildId: msg.guild.id
      }).exec()
      let userLevel = member.level || 0
      if (x === 1) {
        await embed.addField(`:first_place: ${user.username}#${user.discriminator}`, `Level: :1234: **${userLevel}** | EXP: :sparkles: **${member.exp}**/**${member.expNeeded}**`)
      } else if (x === 2) {
        await embed.addField(`:second_place: ${user.username}#${user.discriminator}`, `Level: :1234: **${userLevel}** | EXP: :sparkles: **${member.exp}**/**${member.expNeeded}**`)
      } else if (x === 3) {
        await embed.addField(`:third_place: ${user.username}#${user.discriminator}`, `Level: :1234: **${userLevel}** | EXP: :sparkles: **${member.exp}**/**${member.expNeeded}**`)
      } else {
        await embed.addField(`#${x} ${user.username}#${user.discriminator}`, `Level: :1234: **${userLevel}** | EXP: :sparkles: **${member.exp}**/**${member.expNeeded}**`)
      }
      x++
    })
    await msg.reply({ embeds: [embed] })
    return true
  }
}

module.exports = LevelsCommand