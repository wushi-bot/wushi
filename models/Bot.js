import { Client, Collection } from 'discord.js'
import { KSoftClient } from '@ksoft/api'
import { DRepClient } from '@drep/api'
import fs from 'fs'
import path from 'path'
import { Logger } from '../utils/logger'

import 'dotenv/config'

class Bot extends Client {
  constructor (options) {
    super(options)
    this.commands = new Collection()
    this.aliases = new Collection()
    this.cooldowns = new Collection()
    this.ksoft = new KSoftClient(process.env.KSOFT_TOKEN)
    this.drep = new DRepClient(process.env.DREP_TOKEN)
    this.logger = new Logger()
    this.version = '2.0.0'
    this.owners = ['488786712206770196']
  }

  login (token) {
    super.login(token)
    return this
  }

  async loadCommands () {
    this.logger.log('info', '[Commands] Beginning to check for commands...')
    const folders = fs.readdirSync(path.join(__dirname, '..', '/commands/'), { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
    for (const folder of folders) {
      const commands = fs.readdirSync(path.join(__dirname, '..', '/commands/', folder.name))
      for (const cmd of commands) {
        try {
          const command = new (require(path.join(__dirname, '..', '/commands/', folder.name, cmd)))(this)
          this.commands.set(command.conf.name, command)
          command.conf.aliases.forEach(alias => {
            this.aliases.set(alias, command.conf.name)
          })
          this.logger.log('info', `[Commands] Registered command ${cmd}`)
        } catch (e) {
          this.logger.log('info', `[Commands] Skipped command because it encountered an error: ${e}`)
        }
      }
    }
    this.logger.log('info', '[Commands] Done!')
  }

  loadEvents () {
    this.logger.log('info', '[Events] Beginning to check for events...')
    fs.readdir(path.join(__dirname, '..', '/events/'), (err, files) => {
      if (err) return console.error(err)
      files.forEach(file => {
        const event = require(path.join(__dirname, '..', `/events/${file}`))
        const eventName = file.split('.')[0]
        this.logger.log('info', `[Events] Added event: ${eventName}.js`)
        super.on(eventName, (...args) => event.run(this, ...args))
      })
    })
    this.logger.log('info', '[Events] Done!')
  }
}

module.exports = Bot
