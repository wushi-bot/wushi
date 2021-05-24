import { Client, Collection } from 'discord.js-light'
import { readdir, readdirSync } from 'fs'
import path from 'path'
import { Logger } from '../utils/logger'

import 'dotenv/config'

class Bot extends Client {
  constructor (options) {
    super(options)
    this.logger = new Logger()
    this.commands = new Collection()
    this.aliases = new Collection()
    this.cooldowns = new Collection()
    this.version = '2.2.0'
    this.owners = ['488786712206770196']
  }

  login (token) {
    super.login(token)
    return this
  }

  loadCommands () {
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
          this.logger.log('runner', `Registered command ${cmd}`)
        } catch (e) {
          this.logger.log('runner', `Skipped command because it encountered an error: ${e}`)
        }
      }
    }
    this.logger.log('info', 'All possible commands have been added.')
  }

  loadEvents () {
    this.logger.log('info', 'Beginning to check for events...')
    readdir(path.join(__dirname, '..', '/events/'), (err, files) => {
      if (err) return console.error(err)
      files.forEach(file => {
        if (file.endsWith('.js')) {
          const event = require(path.join(__dirname, '..', `/events/${file}`))
          const eventName = file.split('.')[0]
          this.logger.log('runner', `Added event: ${eventName}`)
          super.on(eventName, (...args) => event.run(this, ...args))
        }
      })
    })
    this.logger.log('info', 'All possible events have been added.')
  }
}

module.exports = Bot