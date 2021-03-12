import { IntentsString } from 'discord.js'
import 'dotenv/config'
import Bot from './structs/client'

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

const intents: Array<IntentsString> = ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS', 'GUILD_PRESENCES']
const token = process.env.TOKEN || 'none'
const bot = new Bot(token, {
  ws: { intents: intents },
  fetchAllMembers: true
})
bot.loadCommands()
bot.loadEvents()
bot.run()