import Client from './classes/Client'
import Database from './database'
import 'dotenv/config'
import { runPetChecks, runUnvoteChecks } from './utils/economy'

const intents = ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS', 'GUILD_PRESENCES']

const self = new Client({
  fetchAllMembers: true,
  intents: intents
})

new Database()

async () => {
  await runPetChecks(self)
  await runUnvoteChecks(self)
}

self.load()
self.start(process.env.TOKEN!!)