import { Intents } from 'discord.js'
import Bot from './models/Client'
import 'dotenv/config'

import * as Sentry from '@sentry/node'
import * as Tracing from '@sentry/tracing'

const client = new Bot({ intents: [Intents.FLAGS.GUILDS] })

Sentry.init({
    dsn: 'https://8e385cbdca7840589531ee28e4058bb8@o453555.ingest.sentry.io/5519188',
    tracesSampleRate: 1.0,
})

client.loadCommands()
client.loadEvents()
client.start() 