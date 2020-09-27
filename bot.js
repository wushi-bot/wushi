const discord = require('discord.js')
const chalk = require('chalk')
const fs = require('fs')
const db = require('quick.db')

const bot = new discord.Client()
bot.commands = new discord.Collection()
bot.aliases = new discord.Collection()
const cooldowns = new discord.Collection()
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

module.exports.getPrefix = function (id) {
  if (!cfg.get(`${id}.prefix`)) {
    return '.'
  } else {
    return cfg.get(`${id}.prefix`)
  }
}

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

bot.on('message', async message => {
  if (message.content === `<@!${bot.user.id}>` || message.content === `<@${bot.user.id}>`) {
    return message.channel.send(`Howdy, I'm <@!${bot.user.id}>!\n\nMy prefix is \`${this.getPrefix(message.guild.id)}\` in this server, do \`${this.getPrefix(message.guild.id)}help\` (or \`${this.getPrefix(message.guild.id)}commands\`) to see a list of my commands!`)
  }
  const prefix = this.getPrefix(message.guild.id)
  if (!message.content.startsWith(prefix)) return
  const command = message.content.split(' ')[0].slice(prefix.length)
  const args = message.content.split(' ').slice(1)
  let cmd
  if (bot.commands.has(command)) {
    cmd = bot.commands.get(command)
  } else {
    cmd = bot.commands.get(bot.aliases.get(command))
  }
  if (cmd != null) {
    if (!cooldowns.has(command.name)) {
      cooldowns.set(command.name, new discord.Collection())
    }

    const now = Date.now()
    const timestamps = cooldowns.get(cmd.name)
    const cooldownAmount = (cmd.cooldown || 3) * 1000
    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000
        const embed = new discord.MessageEmbed()
          .setTitle(`:stopwatch: You are on cooldown for ${timeLeft.toFixed(1)} more second(s)!`)
          .setFooter(`You can reuse ${prefix}${command} in ${timeLeft.toFixed(1)} more second(s)!`)
        console.log(chalk.yellow('>') + ` ${message.author.username}#${message.author.discriminator} executed ${prefix}${command} but was on cooldown for ${timeLeft.toFixed(1)} more seconds.`)
        return message.channel.send(embed)
      }
    } else {
      timestamps.set(message.author.id, now)
      setTimeout(() => timestamps.delete(message.author.id), cooldownAmount)
    }

    try {
      console.log(chalk.yellow('>') + ` ${message.author.username}#${message.author.discriminator} executed ${prefix}${command}.`)
      if (!message.guild.me.hasPermission('EMBED_LINKS')) {
        return message.reply('I lack the ability to create embeds, thus most commands will not work, please contact a **Server Administrator** about this.')
      }
      cmd.run(bot, message, args)
    } catch (e) {
      console.log(e)
    }
  }
})

bot.on('ready', () => {
  console.log(chalk.green('>') + ` Ready! Logged in as ${bot.user.username}#${bot.user.discriminator}`)
  bot.user.setActivity('with 🍣 | .help', { type: 'PLAYING' })
})

bot.login(process.env.TOKEN)
