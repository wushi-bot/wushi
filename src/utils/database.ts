import GuildSchema from '../schemas/Guild'
import MemberSchema from '../schemas/Member'
import UserSchema from '../schemas/User'
import { Guild } from "discord.js";

export async function getGuild(guild: Guild) {
  const result = await GuildSchema.findOne({
    id: guild.id
  }).exec()
  return result
}

export async function getMember(member, guildId) {
  const result = await MemberSchema.findOne({
    userId: member,
    guildId: guildId
  }).exec()
  return result
}

export async function getUser(user) {
  const result = await UserSchema.findOne({
    id: user
  }).exec()
  return result
}