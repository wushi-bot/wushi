
import db from 'quick.db'
import { MessageEmbed } from 'discord.js-light'
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

module.exports.runUnbanChecks = async function (bot) {
  setInterval(() => {
    const date = new Date().getTime()
    const bans = mod.get('unbans') || []
    if (bans.length > 0) {
      for (let ban of bans) {
        if (ban.unbanAt !== false) {
          if (ban.unbanAt <= date) {
            let removing = bans.filter(function (x) { return x === ban })[0]
            let i = bans.indexOf(removing)
            bans.splice(i, 1)
            mod.set('unbans', bans)
            attemptUnban(ban.guild, ban.user, ban.punisher, bot)
          }
        }
      }
    }
  }, (8000))
}

module.exports.runUnlockChecks = async function (bot) {
  setInterval(() => {
    const date = new Date().getTime()
    const unlocks = mod.get('unlocks') || []
    if (unlocks.length > 0) {
      for (let unlock of unlocks) {
        if (unlock.unlockAt !== false) {
          if (unlock.unlockAt <= date) {
            let removing = unlocks.filter(function (x) { return x === unlock })[0]
            let i = unlocks.indexOf(removing)
            unlocks.splice(i, 1)
            mod.set('unlocks', unlocks)
            attemptUnlock(unlock.guild, unlock.channel, unlock.punisher, bot)
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

async function attemptUnban (guild, user, punisher, bot) {
  const g = bot.guilds.cache.get(guild)
  const m = bot.users.cache.get(user)
  const m2 = g.members.cache.get(punisher)
  const channel = g.channels.cache.get(cfg.get(`${guild}.modLog`))
  try {
    await g.members.unban(user, 'Unbanning user')
    const embed = new MessageEmbed() 
      .setColor('#5ca5e0')
      .setAuthor(`${m2.user.username}#${m2.user.discriminator} (${m2.user.id})`, m2.user.avatarURL())
      .setDescription(`**User:** ${m.username}#${m.discriminator} (${m.id})\n**Action:** Unban\n**Reason:** Automatic Unban`)
    channel.send(embed)
  } catch (e) {
    console.error(e)
  }
}

async function attemptUnlock (guild, c, punisher, bot) {
  const g = bot.guilds.cache.get(guild)
  const ch = g.channels.cache.get(c)
  const m2 = g.members.cache.get(punisher)
  const channel = g.channels.cache.get(cfg.get(`${guild}.modLog`))
  if (ch) {
    try {
      ch.updateOverwrite(g.roles.everyone, {
        SEND_MESSAGES: null
      })
      const embed = new MessageEmbed() 
        .setColor('#5ca5e0')
        .setAuthor(`${m2.user.username}#${m2.user.discriminator} (${m2.user.id})`, m2.user.avatarURL())
        .setDescription(`**Channel:** <#${ch.id}>\n**Action:** Unlock\n**Reason:** Automatic Unlock`)
      channel.send(embed)
    } catch (e) {
      console.error(e)
    }
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

module.exports.addUnban = async function (guild, users, punisher, date, c) {
  if (!(users instanceof Array)) {
    users = [users]
  }
  for (let user of users) {
    if (date !== -1) {
      mod.push('unbans', { guild: guild, user: user, punisher: punisher, unbanAt: date, caseId: c }) 
    } else {
      mod.push('unbans', { guild: guild, user: user, punisher: punisher, unbanAt: false, caseId: c }) 
    }
  }
}

module.exports.addUnlock = async function (guild, channels, punisher, date, c) {
  if (!(channels instanceof Array)) {
    channels = [channels]
  }
  for (let channel of channels) {
    if (date !== -1) {
      mod.push('unlocks', { guild: guild, channel: channel, punisher: punisher, unlockAt: date, caseId: c }) 
    } else {
      mod.push('unlocks', { guild: guild, channel: channels, punisher: punisher, unlockAt: false, caseId: c }) 
    }
  }
}