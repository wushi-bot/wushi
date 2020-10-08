const discord = require('discord.js')
const chalk = require('chalk')
const fs = require('fs')
const db = require('quick.db')

const bot = new discord.Client()
bot.commands = new discord.Collection()
bot.aliases = new discord.Collection()
bot.cooldowns = new discord.Collection()
require('dotenv').config()

const cfg = new db.table('config')
const economy = new db.table('economy')

module.exports.addMoney = function (a, id) {
  if (economy.get(`${id}.effects`).includes('doubling')) {
    economy.add(`${id}.balance`, a * 2)
    return a * 2
  } else {
    economy.add(`${id}.balance`, a)
    return a
  }
}

module.exports.removeA = function (arr) {
  const a = arguments
  let L = a.length
  let ax
  const what = a[--L]
  if ((ax = arr.indexOf(what)) !== -1) {
    arr.splice(ax, 1)
  }
  return arr
}

module.exports.getPrefix = function (id) {
  if (!cfg.get(`${id}.prefix`)) {
    return '.'
  } else {
    return cfg.get(`${id}.prefix`)
  }
}

fs.readdir('./events/', (err, files) => {
  if (err) return console.error(err)
  files.forEach(file => {
    const event = require(`./events/${file}`)
    const eventName = file.split('.')[0]
    console.log(chalk.blue('>') + ` Added event: ${eventName}`)
    bot.on(eventName, (...args) => event.run(bot, ...args))
  })
})

const cmdFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
for (const file of cmdFiles) {
  const command = require(`./commands/${file}`)
  if (command.hasOwnProperty('help')) {
    bot.commands.set(command.help.name, command)
    command.help.aliases.forEach(alias => {
      bot.aliases.set(alias, command.help.name)
    })
    console.log(chalk.green('>') + ` Registered command ${file} (name: ${command.help.name} | aliases: ${command.help.aliases})`)
  } else {
    console.log(chalk.gray('>') + ' Skipped command as it does not have a working name.')
  }
}

bot.login(process.env.TOKEN)
