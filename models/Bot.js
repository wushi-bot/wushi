import { Client, Collection } from 'discord.js'
import { KSoftClient } from '@ksoft/api'
import fs from 'fs'
import chalk from 'chalk'
import path from 'path'

class Bot extends Client {
  constructor (options) {
    super(options)
    this.commands = new Collection()
    this.aliases = new Collection()
    this.cooldowns = new Collection()
    this.ksoft = new KSoftClient(process.env.KSOFT_TOKEN)
    this.version = '2.0.0'
  }

  login (token) {
    super.login(token)
    return this
  }

  async loadCommands () {
    console.log(chalk.magenta('>') + ' [Commands] Beginning to check for commands...')
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
          console.log(chalk.green('>') + ` [Commands] Registered command ${cmd}`)
        } catch (e) {
          console.log(chalk.gray('>') + ` [Commands] Skipped command because it encountered an error: ${e}`)
        }
      }
    }
    console.log(chalk.magenta('>') + ' [Commands] Done!')
  }

  loadEvents () {
    console.log(chalk.magenta('>') + ' [Events] Beginning to check for events...')
    fs.readdir(path.join(__dirname, '..', '/events/'), (err, files) => {
      if (err) return console.error(err)
      files.forEach(file => {
        const event = require(path.join(__dirname, '..', `/events/${file}`))
        const eventName = file.split('.')[0]
        console.log(chalk.blue('>') + ` [Events] Added event: ${eventName}.js`)
        super.on(eventName, (...args) => event.run(this, ...args))
      })
    })
    console.log(chalk.magenta('>') + ' [Events] Done!')
  }
}

module.exports = Bot
