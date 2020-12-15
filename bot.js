import * as Sentry from '@sentry/node'
import { Integrations } from '@sentry/tracing'

import Bot from './models/Bot'
import 'dotenv/config'

/*
 ___       __   ___  ___  ________  ___  ___  ___
|\  \     |\  \|\  \|\  \|\   ____\|\  \|\  \|\  \
\ \  \    \ \  \ \  \\\  \ \  \___|\ \  \\\  \ \  \
 \ \  \  __\ \  \ \  \\\  \ \_____  \ \   __  \ \  \
  \ \  \|\__\_\  \ \  \\\  \|____|\  \ \  \ \  \ \  \
   \ \____________\ \_______\____\_\  \ \__\ \__\ \__\
    \|____________|\|_______|\_________\|__|\|__|\|__|
                            \|_________|
*/

Sentry.init({
  dsn: process.env.SENTRY,
  integrations: [
    new Integrations.BrowserTracing()
  ],
  tracesSampleRate: 1.0
})

const intents = ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS']
const self = new Bot({
  ws: { intents: intents },
  fetchAllMembers: true
})
self.loadCommands()
self.loadEvents()
self.login(process.env.TOKEN)

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error)
})

process.on('uncaughtException', error => {
  console.error('Uncaught exception:', error)
})
