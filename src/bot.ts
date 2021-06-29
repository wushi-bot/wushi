import Client from './classes/Client'
import 'dotenv/config'

const intents = ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS', 'GUILD_PRESENCES']

const self = new Client({
  cacheMembers: true,
  cacheRoles: true,
  cacheChannels: true,
  intents: intents
})

self.load()
self.start(process.env.TOKEN!!)