import discord from 'discord.js'
import db from 'quick.db'
import utils from '../utils/utils'
import chalk from 'chalk'
const cfg = new db.table('config')

exports.run = (bot, message) => {
  if (message.author.bot) return
  if (message.content === `<@!${bot.user.id}>` || message.content === `<@${bot.user.id}>`) {
    return message.channel.send(`Howdy, I'm <@!${bot.user.id}>!\n\nMy prefix is \`${utils.getPrefix(message.guild.id)}\` in this server, do \`${utils.getPrefix(message.guild.id)}help\` (or \`${utils.getPrefix(message.guild.id)}commands\`) to see a list of my commands!`)
  }
  const prefix = utils.getPrefix(message.guild.id)
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
    if (!bot.cooldowns.has(command.name)) {
      bot.cooldowns.set(command.name, new discord.Collection())
    }

    const now = Date.now()
    const timestamps = bot.cooldowns.get(cmd.name)
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
      if (!message.guild.me.hasPermission('EMBED_LINKS')) {
        return message.reply('I lack the ability to create embeds, thus most commands will not work, please contact a **Server Administrator** about this.')
      }
      if (cfg.get(`${message.guild.id}.disabled`).includes(cmd.conf.category)) {
        return console.log(chalk.yellow('>') + ` ${message.author.username}#${message.author.discriminator} attempted to execute ${prefix}${command}, but that command was disabled.`)
      }
      cmd.run(bot, message, args)
      console.log(chalk.yellow('>') + ` ${message.author.username}#${message.author.discriminator} executed ${prefix}${command}.`)
    } catch (e) {
      console.log(e)
    }
  }
}
