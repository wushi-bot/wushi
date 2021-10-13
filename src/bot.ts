import { Intents } from 'discord.js'
import Bot from './models/Client'
import 'dotenv/config'

import * as Sentry from '@sentry/node'
import * as Tracing from '@sentry/tracing'

const intents = new Intents()
    .add(
        Intents.FLAGS.GUILDS, 
        Intents.FLAGS.GUILD_PRESENCES, 
        Intents.FLAGS.GUILD_MEMBERS, 
        Intents.FLAGS.GUILD_MESSAGES 
    )

const client = new Bot({ intents: [ 
    intents
] })

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
})

client.loadCommands()
client.loadEvents()
client.start() 