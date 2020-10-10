import { Client, Collection } from 'discord.js'
import chalk from 'chalk'
import fs from 'fs'
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

class Wushi extends Client {
  constructor () {
    super()
    this.commands = new Collection()
    this.aliases = new Collection()
    this.cooldowns = new Collection()
  }

  login (token) {
    super.login(token)
    return this
  }

  loadCommands () {
    const cmdFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
    for (const file of cmdFiles) {
      const command = require(`./commands/${file}`)
      if (command.hasOwnProperty('help')) {
        this.commands.set(command.help.name, command)
        command.help.aliases.forEach(alias => {
          this.aliases.set(alias, command.help.name)
        })
        console.log(chalk.green('>') + ` Registered command ${file} (name: ${command.help.name} | aliases: ${command.help.aliases})`)
      } else {
        console.log(chalk.gray('>') + ' Skipped command as it does not have a working name.')
      }
    }
  }

  loadEvents () {
    fs.readdir('./events/', (err, files) => {
      if (err) return console.error(err)
      files.forEach(file => {
        const event = require(`./events/${file}`)
        const eventName = file.split('.')[0]
        console.log(chalk.blue('>') + ` Added event: ${eventName}`)
        super.on(eventName, (...args) => event.run(this, ...args))
      })
    })
  }
}

const me = new Wushi()
me.loadCommands()
me.loadEvents()
me.login(process.env.TOKEN)
