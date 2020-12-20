import * as Sentry from '@sentry/node'
import { Integrations } from '@sentry/tracing'
<<<<<<< HEAD
=======
import chalk from 'chalk'
>>>>>>> 742ccee4fa367296299d284ba31b3c6e6d190e23

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

<<<<<<< HEAD
=======
if (!process.env.SENTRY) console.log(`${chalk.gray('>')} Cannot find SENTRY variable, error logging will not work.`)
if (!process.env.CLIENT_SECRET) console.log(`${chalk.gray('>')} Cannot find CLIENT_SECRET variable, authentication will not work in the website.`)
if (!process.env.DBL_TOKEN) console.log(`${chalk.gray('>')} Cannot find DBL_TOKEN variable, server posting will not work.`)
if (!process.env.TOKEN) console.log(`${chalk.gray('>')} Cannot find TOKEN variable, the bot & web will not work.`)
if (!process.env.DOMAIN) console.log(`${chalk.gray('>')} Cannot find DOMAIN variable, authentication will not work.`)
if (!process.env.KSOFT_TOKEN) console.log(`${chalk.gray('>')} Cannot find KSOFT_TOKEN variable, Ksoft.si commands will not work.`)

>>>>>>> 742ccee4fa367296299d284ba31b3c6e6d190e23
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
