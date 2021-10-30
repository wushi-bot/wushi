import GuildSchema from '../schemas/Guild'
import { Guild } from "discord.js";

export async function getGuild(guild: Guild) {
  const result = await GuildSchema.findOne({
    id: guild.id
  }).exec()
  return result
}