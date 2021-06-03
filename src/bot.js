import Bot from './structs/client'
import economyUtils from './utils/economy'

import 'dotenv/config'

const intents = ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS', 'GUILD_PRESENCES']
const partials = ['USER']
const self = new Bot({
  cacheMembers: true,
  cacheRoles: true,
  intents: intents,
  partials: partials
})

self.loadCommands()
self.loadEvents()

economyUtils.runUnvoteChecks(self)
economyUtils.runPetChecks(self)

self.login(process.env.TOKEN)
