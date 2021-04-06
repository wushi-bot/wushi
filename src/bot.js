import Bot from './structs/client'
import moderationUtils from './utils/moderation'

import 'dotenv/config'

const intents = ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS', 'GUILD_PRESENCES']
const self = new Bot({
  intents: intents,
  //fetchAllMembers: true
})
self.loadCommands()
self.loadEvents()

moderationUtils.runUnmuteChecks(self)
moderationUtils.runUnlockChecks(self)

self.login(process.env.TOKEN)
