import Guild from '../models/Guild'
import User from '../models/User'
import Member from '../models/Member'

import chalk from 'chalk'

export const checkUser = async function (user, bot = null) {
  let userResult = await User.findOne({
    id: user,
  }).exec()
  if (!userResult) {
    let profile = new User({
      id: user
    })
    profile.save()
    bot.logger.log('info', `Created a user profile for ${chalk.green(user)}.`)
    return profile
  }
}

export const checkGuild = async function (guild, bot = null) {
  let guilds = await Guild.find({
    id: guild
  }).exec()
  if (!guilds[0]) {
    let guildProfile = new Guild({
      id: guild,
      prefix: '.'
    })
    guildProfile.save()
    bot.logger.log('info', `Created a guild profile for ${chalk.green(guild)}.`)
    return guildProfile
  }
}

export const checkMember = async function (guild, user, bot = null) {
  let members = await Member.find({
    guildId: guild,
    userId: user
  }).exec()
  if (!members[0]) {
    let memberProfile = new Member({
      userId: user,
      guildId: guild
    })
    bot.logger.log('info', `Created a member profile for ${chalk.green(user)} (${chalk.green(guild)}).`)
    return memberProfile
  }
}
