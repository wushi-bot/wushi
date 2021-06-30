import Client from './classes/Client'
import 'dotenv/config'
import { runPetChecks, runUnvoteChecks } from './utils/economy'

const intents = ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS', 'GUILD_PRESENCES']

const self = new Client({
  cacheMembers: true,
  cacheRoles: true,
  cacheChannels: true,
  intents: intents
})

runPetChecks(self)
runUnvoteChecks(self)

self.load()
self.start(process.env.TOKEN!!)