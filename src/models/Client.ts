import { Client, ClientOptions, Collection } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'

import fs from 'fs'
import path from 'path'

import { createLogger, format, transports } from 'winston'
const { combine, timestamp, label, printf } = format

const f = printf(({ level, message, label, timestamp }) => {
  return `[${label}] ${timestamp} ${level}: ${message}`
})

import { XKCDClient } from '@aero/xkcd'

export default class Bot extends Client {

    owners: Array<String>
    version: String
    botRest: REST
    commands: any
    logger: any 

    xkcdClient: XKCDClient

    constructor(options: ClientOptions) {
      super(options)
      this.version = '4.0.4'
      this.owners = ['488786712206770196']
      this.commands = new Collection()
      this.botRest = new REST({ version: '9' }).setToken(process.env.TOKEN!!)
      this.logger = createLogger({
        format: combine(
          label({ label: 'wushi' }),
          timestamp(),
          f
        ),
        transports: [
          new transports.Console(),
          new transports.File({ filename: 'bot.log' })
        ]
      })
      this.xkcdClient = new XKCDClient()
    }

    start() {
      super.login(process.env.TOKEN!!)
      return this
    }

    async loadCommands() {
      const files = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.ts') || file.endsWith('.js'))
      const commands = []

      for (const file of files) {
        try {
          const command = new (require(path.join(__dirname, '../commands', file)))
          if (command instanceof SlashCommandBuilder) commands.push(command.toJSON())
          this.commands.set(command.name, command)
          this.logger.info(`Successfully registered ${file} as a command.`)
        } catch (e) {
          this.logger.error(`Tried to register ${file} as a command but couldn't: ${e}`)
        }
      }
      if (process.env.ENVIRONMENT === 'PRODUCTION') {
        await this.botRest.put(
          Routes.applicationCommands(process.env.CLIENT_ID!!),
          { body: commands },
        );
      } else {
        await this.botRest.put(
          Routes.applicationGuildCommands(process.env.CLIENT_ID!!, '777620712193392650'),
          { body: commands },
        )
      }
    }

    /*async loadContexts() {

    }*/

    async loadEvents() {
      fs.readdir(path.join(__dirname, '..', '/events/'), (err, files) => {
        files.forEach(file => {
          if (file.endsWith('.js') || file.endsWith('.ts')) {
            const event = require(path.join(__dirname, '..', `/events/${file}`))
            const eventName = file.split('.')[0]
            super.on(eventName, (...args) => event.run(this, ...args))
            this.logger.info(`Now listening for ${eventName}`)
          }
        })
        if (err) return console.error(err)
      })
    }


}