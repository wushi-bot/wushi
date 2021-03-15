import { Client, Collection } from 'discord.js'
import { readdir, readdirSync } from 'fs'
import path from 'path'
import chalk from 'chalk'

import 'dotenv/config'

class Bot extends Client {
  constructor (options) {
    super(options)
    this.commands = new Collection()
    this.aliases = new Collection()
    this.cooldowns = new Collection()
    this.version = '2.1.0'
    this.owners = ['488786712206770196']
    this.carbonaraURL = process.env.CARBONARA
  }

  login (token) {
    super.login(token)
    return this
  }

  loadCommands () {
    console.log('Beginning to check for commands...')
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
          console.log(`Registered command ${cmd}`)
        } catch (e) {
          console.log(`Skipped command because it encountered an error: ${e}`)
        }
      }
    }
    console.log('All possible commands have been added.')
  }

  loadEvents () {
    console.log('Beginning to check for events...')
    readdir(path.join(__dirname, '..', '/events/'), (err, files) => {
      if (err) return console.error(err)
      files.forEach(file => {
        const event = require(path.join(__dirname, '..', `/events/${file}`))
        const eventName = file.split('.')[0]
        console.log(`Added event: ${eventName}`)
        super.on(eventName, (...args) => event.run(this, ...args))
      })
    })
    console.log('All possible events have been added.')
  }
}

module.exports = Bot