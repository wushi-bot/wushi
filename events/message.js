import discord from 'discord.js'
import db from 'quick.db'
import utils from '../utils/utils'
import chalk from 'chalk'

const cfg = new db.table('config')
const leveling = new db.table('leveling')
const eco = new db.table('economy')

const expCooldowns = new discord.Collection()

exports.run = (bot, message) => {
  if (message.author.bot) return
  if (!message.guild.me.hasPermission('SEND_MESSAGES')) return
  if (cfg.get(`${message.guild.id}.disabled`)) {
    if (!cfg.get(`${message.guild.id}.disabled`).includes('Leveling')) {
      utils.checkLevel(message.author.id, message.guild.id)
      if (!message.content.startsWith(utils.getPrefix(message.guild.id))) {
        if (!expCooldowns.has(message.author.id)) {
          const exp = utils.getRandomInt(10, 20)
          leveling.add(`${message.guild.id}.${message.author.id}.exp`, exp)
          leveling.add(`${message.guild.id}.${message.author.id}.totalExp`, exp)
          if (leveling.get(`${message.guild.id}.${message.author.id}.expNeeded`) <= leveling.get(`${message.guild.id}.${message.author.id}.exp`)) {
            leveling.add(`${message.guild.id}.${message.author.id}.level`, 1)
            leveling.subtract(`${message.guild.id}.${message.author.id}.exp`, leveling.get(`${message.guild.id}.${message.author.id}.expNeeded`))
            leveling.set(`${message.guild.id}.${message.author.id}.expNeeded`, Math.floor(leveling.get(`${message.guild.id}.${message.author.id}.expNeeded`) + (leveling.get(`${message.guild.id}.${message.author.id}.expNeeded`) * 0.1)))
            if (!cfg.get(`${message.guild.id}.levelUpMessage`)) { // Fallback to default thingy
              message.channel.send(`Congratulations, **${message.author.username}**, you've leveled :up: to **Level ${leveling.get(`${message.guild.id}.${message.author.id}.level`)}**!`)
            } else {
              let lvlMsg = cfg.get(`${message.guild.id}.levelUpMessage`)
              lvlMsg = lvlMsg.replace('{level}', `${leveling.get(`${message.guild.id}.${message.author.id}.level`)}`)
              lvlMsg = lvlMsg.replace('{user.name}', `${message.author.username}`)
              lvlMsg = lvlMsg.replace('{user.mention}', `<@!${message.author.id}>`)
              lvlMsg = lvlMsg.replace('{user.id}', `${message.author.id}`)
              lvlMsg = lvlMsg.replace('{user.discrim}', `${message.author.discriminator}`)
              lvlMsg = lvlMsg.replace('{nextExp}', `${leveling.get(`${message.guild.id}.${message.author.id}.expNeeded`)}`)
              message.channel.send(lvlMsg)
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
    if (message.guild.me.hasPermission('EMBED_LINKS')) {
      const embed = new discord.MessageEmbed()
        .setColor('#0099ff')
        .setAuthor(message.author.tag, message.author.avatarURL())
        .setThumbnail(bot.user.avatarURL())
        .setDescription(`Howdy, I'm <@!${bot.user.id}>! My prefix is \`${utils.getPrefix(message.guild.id)}\` in this server, do \`${utils.getPrefix(message.guild.id)}help\` (or \`${utils.getPrefix(message.guild.id)}commands\`) to see a list of my commands!`)
        .addField(':floppy_disk: Website', 'https://wushibot.xyz', true)
        .addField(':scroll: Documentation', 'https://docs.wushibot.xyz', true)
      return message.channel.send(embed)
    } else {
      return message.channel.send(`Howdy, I'm <@!${bot.user.id}>! My prefix is \`${utils.getPrefix(message.guild.id)}\` in this server, do \`${utils.getPrefix(message.guild.id)}help\` (or \`${utils.getPrefix(message.guild.id)}commands\`) to see a list of my commands!`)
    }
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
    const cooldownAmount = (cmd.conf.cooldown || 3) * 1000
    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000
        const embed = new discord.MessageEmbed()
          .setColor('#e31937')
          .setAuthor(message.author.tag, message.author.avatarURL())
          .setDescription(`:watch: You're still on cooldown for \`${timeLeft.toFixed(1)}\` more second(s)!`)
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
          return bot.logger.log('info', `[Event] ${message.author.username}#${message.author.discriminator} attempted to execute ${prefix}${command}, but that command was disabled.`)
        }
      }
      if (cmd.conf.enabled === false) return
      if (cmd.conf.category === 'Admin') {
        if (!bot.owners.includes(message.author.id)) return message.reply('You cannot use this command as you aren\'t a **Bot Admin**.')
      }
      cmd.run(bot, message, args)
      bot.logger.log('info', `[Event] ${message.author.username}#${message.author.discriminator} executed ${prefix}${command}.`)
    } catch (e) {
      console.log(e)
    }
  }
}
