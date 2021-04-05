
import db from 'quick.db'
import { MessageEmbed } from 'discord.js'
import utils from './utils'

const mod = new db.table('moderation')
const cfg = new db.table('config')

module.exports.runUnmuteChecks = async function (bot) {
  setInterval(() => {
    const date = new Date().getTime()
    const mutes = mod.get('unmutes') || []
    if (mutes.length > 0) {
      for (let mute of mutes) {
        if (mute.unmuteAt !== false) {
          if (mute.unmuteAt <= date) {
            let removing = mutes.filter(function (x) { return x === mute })[0]
            let i = mutes.indexOf(removing)
            mutes.splice(i, 1)
            mod.set('unmutes', mutes)
            attemptUnmute(mute.guild, mute.user, mute.punisher, bot)
          }
        }
      }
    }
  }, (8000))
}

async function attemptUnmute (guild, user, punisher, bot) {
  const mR = cfg.get(`${guild}.mutedRole`)
  const g = bot.guilds.cache.get(guild)
  const role = g.roles.cache.get(mR)
  const member = g.members.cache.get(user)
  const m2 = g.members.cache.get(punisher)
  const channel = g.channels.cache.get(cfg.get(`${guild}.modLog`))
  try {
    member.roles.remove(role, 'Unmuting user')
    const embed = new MessageEmbed() 
      .setColor('#5ca5e0')
      .setAuthor(`${m2.user.username}#${m2.user.discriminator} (${m2.user.id})`, m2.user.avatarURL())
      .setDescription(`**User:** ${member.user.username}#${member.user.discriminator} (${member.user.id})\n**Action:** Unmute\n**Reason:** Automatic Unmute`)
    channel.send(embed)
  } catch (e) {
    console.error(e)
  }
}

module.exports.addUnmute = async function (guild, users, punisher, date, c) {
  if (!(users instanceof Array)) {
    users = [users]
  }
  for (let user of users) {
    if (date !== -1) {
      mod.push('unmutes', { guild: guild, user: user, punisher: punisher, unmuteAt: date, caseId: c }) 
    } else {
      mod.push('unmutes', { guild: guild, user: user, punisher: punisher, unmuteAt: false, caseId: c }) 
    }
  }
}
