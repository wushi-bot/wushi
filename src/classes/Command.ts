import { Client } from "discord.js"

export default class Command {
  conf: any
  client: Client
  constructor (client, {
    name = 'none',
    description = 'No description provided.',
    category = 'Miscellaneous',
    usage = 'No usage provided.',
    enabled = true,
    guildOnly = false,
    aliases = ['none'],
    subcommands = [],
    cooldown = -1
  }) {
    this.client = client
    this.conf = { name, description, category, usage, enabled, guildOnly, aliases, cooldown, subcommands }
  }
}