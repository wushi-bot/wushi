import Bot from './structs/client'
import 'dotenv/config'

const intents = ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS', 'GUILD_PRESENCES']
const self = new Bot({
  intents: intents,
  fetchAllMembers: true
})
self.loadCommands()
self.loadEvents()
self.login(process.env.TOKEN)
