import Bot from "./client"

export default class Command {
  client: Bot
  conf: any

  constructor (client: Bot, {
    name = null,
    description = 'No description provided.',
    category = 'Miscellaneous',
    usage = 'No usage provided.',
    enabled = true,
    guildOnly = false,
    aliases = [],
    cooldown = 0
  }) {
    this.client = client
    this.conf = { name, description, category, usage, enabled, guildOnly, aliases, cooldown }
  }
}