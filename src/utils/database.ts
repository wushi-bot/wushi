import GuildSchema from '../schemas/Guild'
import MemberSchema from '../schemas/Member'
import UserSchema from '../schemas/User'
import { Guild } from "discord.js";

export async function getGuild(guild: Guild) {
  let result = await GuildSchema.findOne({
    id: guild.id
  }).exec()
  if (!result) {
    result = new GuildSchema({
      id: guild.id
    })
    result.save()
    result = await GuildSchema.findOne({
      id: guild.id
    }).exec()
  }
  return result
}

export async function getMember(member, guildId) {
  let result = await MemberSchema.findOne({
    userId: member,
    guildId: guildId
  }).exec()
  if (!result) {
    result = new MemberSchema({
      userId: member,
      guildId: guildId, 
      expNeeded: 100,
      exp: 0,
      level: 0,
      totalExp: 0
    })
    result.save()
    result = await MemberSchema.findOne({
      userId: member,
      guildId: guildId
    }).exec()
  }
  return result
}

export async function getUser(user) {
  let result = await UserSchema.findOne({
    id: user
  }).exec()
  if (!result) {
    result = new UserSchema({
      id: user,
      balance: 0,
      bank: 0
    })
    result.save()
    result = await UserSchema.findOne({
      id: user
    }).exec()
  }
  return result
}