import Bot from './models/Bot'
import 'dotenv/config'
import { MessageEmbed } from 'discord.js'

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

const intents = ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS']
const self = new Bot({ ws: { intents: intents } })
self.loadCommands()
self.loadEvents()
self.login(process.env.TOKEN)

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error)
  self.emit('error', error)
})

process.on('uncaughtException', error => {
  console.error('Uncaught exception:', error)
  self.emit('error', error)
})
