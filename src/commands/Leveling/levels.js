import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js-light'
import db from 'quick.db'
const levels = new db.table('leveling')

class LevelsCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'levels',
      description: 'Gets the top 10 highest EXP users in the server.',
      category: 'Leveling',
      aliases: [],
      usage: 'levels',
      cooldown: 5,
      enabled: false // Disable this for now. 
    })
  }

  async run (bot, msg, args) {
    let list = []
    levels.all().forEach(async entry => {
      if (entry.ID === msg.guild.id) {
        for (var key in entry.data) {
          const user = this.client.users.cache.get(key)
          if (msg.guild.members.resolveID(user)) {
            list.push({ ID: key, totalExp: entry.data[key].totalExp })
          }
        }
      }
    })
    list.sort(function (a, b) { return (b.totalExp) - (a.totalExp) })
    list = list.slice(0, 9)
    const embed = new MessageEmbed()
      .setColor(msg.member.roles.highest.color)
      .setFooter(`🏆 Top 10 EXP users in your server.`)
    let x = 1
    list.forEach(i => {
      const user = this.client.users.cache.get(i.ID)
      let userLevel = levels.get(`${msg.guild.id}.${i.ID}.level`)
      userLevel = userLevel || 0
      if (x === 1) {
        embed.addField(`:first_place: ${user.username}#${user.discriminator}`, `Level: :1234: **${userLevel}** | EXP: :sparkles: **${levels.get(`${msg.guild.id}.${i.ID}.exp`)}**/**${levels.get(`${msg.guild.id}.${i.ID}.expNeeded`)}**`)
      } else if (x === 2) {
        embed.addField(`:second_place: ${user.username}#${user.discriminator}`, `Level: :1234: **${userLevel}** | EXP: :sparkles: **${levels.get(`${msg.guild.id}.${i.ID}.exp`)}**/**${levels.get(`${msg.guild.id}.${i.ID}.expNeeded`)}**`)
      } else if (x === 3) {
        embed.addField(`:third_place: ${user.username}#${user.discriminator}`, `Level: :1234: **${userLevel}** | EXP: :sparkles: **${levels.get(`${msg.guild.id}.${i.ID}.exp`)}**/**${levels.get(`${msg.guild.id}.${i.ID}.expNeeded`)}**`)
      } else {
        embed.addField(`#${x} ${user.username}#${user.discriminator}`, `Level: :1234: **${userLevel}** | EXP: :sparkles: **${levels.get(`${msg.guild.id}.${i.ID}.exp`)}**/**${levels.get(`${msg.guild.id}.${i.ID}.expNeeded`)}**`)
      }
      x++
    })
    msg.reply(embed)
  }
}

module.exports = LevelsCommand