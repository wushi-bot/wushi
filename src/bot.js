import Bot from './structs/client'
import moderationUtils from './utils/moderation'
import economyUtils from './utils/economy'

import 'dotenv/config'

const intents = ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS', 'GUILD_PRESENCES']
const partials = ['USER']
const self = new Bot({
  fetchAllMembers: true,
  intents: intents,
  partials: partials
  //fetchAllMembers: true
})
self.loadCommands()
self.loadEvents()

economyUtils.runUnvoteChecks(self)
moderationUtils.runUnmuteChecks(self)
moderationUtils.runUnlockChecks(self)
moderationUtils.runUnbanChecks(self)

self.login(process.env.TOKEN)
