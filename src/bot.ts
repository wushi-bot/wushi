import Client from './classes/Client'
import Database from './database'
import 'dotenv/config'

const intents = ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS', 'GUILD_PRESENCES']

const self = new Client({
  cacheMembers: true,
  cacheRoles: true,
  intents: intents
})

self.load()
new Database()

self.start(process.env.TOKEN!!)