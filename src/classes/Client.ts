import { Client, Collection } from 'discord.js'
//import TwitchMonitor from './TwitchMonitor'
import Logger from '../utils/logger'
import { readdirSync, readdir } from 'fs'
import path from 'path'

export default class Bot extends Client {

  owners: any
  commands: any
  aliases: any
  cooldowns: any
  logger: Logger
  version: string

  constructor (options: any) {
    super(options)
    this.commands = new Collection()
    this.aliases = new Collection()
    this.cooldowns = new Collection()
    this.logger = new Logger()
    this.version = '3.0.0'
    this.owners = ['488786712206770196']
  }

  start (token: string) {
    super.login(token)
    //const Twitch = new TwitchMonitor(this)
    //Twitch.start()
    return this
  }

  load() {
    this.logger.log('info', 'Beginning to check for commands...')
    const folders = readdirSync(path.join(__dirname, '..', '/commands/'), { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
    for (const folder of folders) {
      const commands = readdirSync(path.join(__dirname, '..', '/commands/', folder.name))
      for (const cmd of commands) {
        try {
          const command = new (require(path.join(__dirname, '..', '/commands/', folder.name, cmd)))(this)
          this.commands.set(command.conf.name, command)
          command.conf.aliases.forEach(alias => {
            this.aliases.set(alias, command.conf.name)
          })
          this.logger.log('info', `Registered command ${cmd}`)
        } catch (e) {
          this.logger.log('error', `Skipped command because it encountered an error: ${e}`)
        }
      }
    }
    this.logger.log('info', 'Beginning to check for events...')
    readdir(path.join(__dirname, '..', '/events/'), (err, files) => {
      files.forEach(file => {
        if (file.endsWith('.js') || file.endsWith('.ts')) {
          const event = require(path.join(__dirname, '..', `/events/${file}`))
          const eventName = file.split('.')[0]
          super.on(eventName, (...args) => event.run(this, ...args))
          this.logger.log('info', `Added event: ${eventName}`)
        }
      })
      if (err) return console.error(err)
    })
  }
}