import { Intents } from 'discord.js'
import Bot from './models/Client'
import mongoose from 'mongoose'
import 'dotenv/config'

import * as Sentry from '@sentry/node'

const intents = new Intents()
  .add(
    Intents.FLAGS.GUILDS, 
    Intents.FLAGS.GUILD_PRESENCES, 
    Intents.FLAGS.GUILD_MEMBERS, 
    Intents.FLAGS.GUILD_MESSAGES 
  )

const client = new Bot({ intents: [ 
    intents
  ]
})

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
})

mongoose.connect(process.env.MONGODB_URI!!, { // @ts-ignore 
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: false,
  family: 4 
})

client.loadCommands()
client.loadEvents()
client.start() 