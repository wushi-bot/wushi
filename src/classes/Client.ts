import { Client, Collection } from 'discord.js-light'
import { readdirSync } from 'fs'
import path from 'path'

export default class Bot extends Client {

  owners: any
  commands: any
  aliases: any
  cooldowns: any
  version: string

  constructor (options: any) {
    super(options)
    this.commands = new Collection()
    this.aliases = new Collection()
    this.cooldowns = new Collection()
    this.version = '3.0.0'
    this.owners = ['488786712206770196']
  }

  start (token: string) {
    super.login(token)
    return this
  }

  load() {
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
        } catch (e) {
          console.error(e)
        }
      }
    }
  }
}