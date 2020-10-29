import discord from 'discord.js'
import db from 'quick.db'
import utils from '../utils/utils'
import chalk from 'chalk'
import moment from 'moment'

const cfg = new db.table('config')
const leveling = new db.table('leveling')
const eco = new db.table('economy')
const serverEco = new db.table('serverEco')

const expCooldowns = new discord.Collection()

exports.run = (bot, message) => {
  if (message.author.bot) return
  if (cfg.get(`${message.guild.id}.disabled`)) {
    if (!cfg.get(`${message.guild.id}.disabled`).includes('Leveling')) {
      utils.checkLevel(message.author.id, message.guild.id)
      if (!message.content.startsWith(utils.getPrefix(message.guild.id))) {
        if (!expCooldowns.has(message.author.id)) {
          const exp = utils.getRandomInt(10, 20)
          leveling.add(`${message.author.id}.${message.guild.id}.exp`, exp)
          if (leveling.get(`${message.author.id}.${message.guild.id}.expNeeded`) <= leveling.get(`${message.author.id}.${message.guild.id}.exp`)) {
            leveling.add(`${message.author.id}.${message.guild.id}.level`, 1)
            leveling.set(`${message.author.id}.${message.guild.id}.exp`, 0)
            leveling.set(`${message.author.id}.${message.guild.id}.expNeeded`, Math.floor(leveling.get(`${message.author.id}.${message.guild.id}.expNeeded`) + (leveling.get(`${message.author.id}.${message.guild.id}.expNeeded`) * 0.1)))
            if (!cfg.get(`${message.guild.id}.levelUpType`)) { // Fallback to default thingy
              if (cfg.get(`${message.guild.id}.levelUpGems`)) {
                var reward = utils.getRandomInt(10, 25)
                serverEco.add(`${message.guild.id}.${message.author.id}.gems`, reward)
                message.channel.send(`Congratulations, **${message.author.username}**, you've leveled :up: to **Level ${leveling.get(`${message.author.id}.${message.guild.id}.level`)}**! (**Reward:** ${reward} :gem:)`)
              } else {
                message.channel.send(`Congratulations, **${message.author.username}**, you've leveled :up: to **Level ${leveling.get(`${message.author.id}.${message.guild.id}.level`)}**!`)
              }
            }
          }
          expCooldowns.set(message.author.id, new discord.Collection())
          setTimeout(() => {
            expCooldowns.delete(message.author.id)
          }, 60000)
        }
      }
    }
  }

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
    if (!bot.cooldowns.has(command)) {
      bot.cooldowns.set(command, new discord.Collection())
    }

    const now = Date.now()
    const timestamps = bot.cooldowns.get(command)
    const cooldownAmount = (cmd.cooldown || 3) * 1000
    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000
        const embed = new discord.MessageEmbed()
          .setColor('#e31937')
          .setTitle(`:stopwatch: Calm down! You're on cooldown for ${timeLeft.toFixed(1)} more second(s)!`)
          .setFooter(`You may reuse ${prefix}${command} in ${timeLeft.toFixed(1)} more second(s)!`)
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
      if (cfg.get(`${message.guild.id}.disabled`)) {
        if (cfg.get(`${message.guild.id}.disabled`).includes(cmd.conf.category)) {
          return console.log(chalk.yellow('>') + ` ${message.author.username}#${message.author.discriminator} attempted to execute ${prefix}${command}, but that command was disabled.`)
        }
      }
      cmd.run(bot, message, args)
      console.log(chalk.yellow('>') + ` ${message.author.username}#${message.author.discriminator} executed ${prefix}${command}.`)
    } catch (e) {
      console.log(e)
    }
  }
}
