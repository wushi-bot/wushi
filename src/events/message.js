import { getPrefix } from '../utils/utils'
import { MessageEmbed, Collection } from 'discord.js-light'
import utils from '../utils/utils'
import chalk from 'chalk'
import db from 'quick.db'

const cfg = new db.table('config')
const leveling = new db.table('leveling')
const tags = new db.table('tags')
const expCooldowns = new Collection()

exports.run = (bot, message) => {
  if (message.author.bot) return
  if (cfg.get(`${message.guild.id}.leveling`)) {
    if (cfg.get(`${message.guild.id}.leveling`)) {
      utils.checkLevel(message.author.id, message.guild.id)
      if (!message.content.startsWith(utils.getPrefix(message.guild.id))) {
        if (!expCooldowns.has(message.author.id)) {
          const exp = utils.getRandomInt(5, 15)
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
          expCooldowns.set(message.author.id, new Collection())
          setTimeout(() => {
            expCooldowns.delete(message.author.id)
          }, 60000)
        }
      }
    }
  }
  if (message.content.startsWith(getPrefix(message.guild.id))) {
    const tag = message.content.toLowerCase().split(' ')[0].slice(getPrefix(message.guild.id).length)
    if (tags.get(`${message.guild.id}.${tag}`)) {
      const { content } = tags.get(`${message.guild.id}.${tag}`)
      bot.logger.log('info', `${chalk.green(`${message.author.username}#${message.author.discriminator} (${message.author.id})`)} just ran ${chalk.green(getPrefix(message.guild.id) + tag)} (tag) in ${chalk.green(message.guild.name + ` (${message.guild.id}).`)}`)
      return message.channel.send(content)
    }
  }
  if (message.content === `<@!${bot.user.id}>` || message.content === `<@${bot.user.id}>`) {
    const embed = new MessageEmbed()
      .setColor('#0099ff')
      .setAuthor(message.author.tag, message.author.avatarURL())
      .setThumbnail(bot.user.avatarURL())
      .setDescription(`Howdy, I'm <@!${bot.user.id}>! My prefix is \`${getPrefix(message.guild.id)}\` in this server, do \`${getPrefix(message.guild.id)}help\` to see a list of my commands!`)
      .addField(':floppy_disk: Support', 'https://discord.gg/zjqeYbNU5F', true)
      .addField(':scroll: Documentation', 'https://docs.wushibot.xyz', true)
    return message.channel.send(embed)
  }
  const prefix = getPrefix(message.guild.id)
  if (!message.content.startsWith(prefix)) return
  const command = message.content.toLowerCase().split(' ')[0].slice(prefix.length)
  const args = message.content.split(' ').slice(1)
  let cmd
  if (bot.commands.has(command)) {
    cmd = bot.commands.get(command)
  } else {
    cmd = bot.commands.get(bot.aliases.get(command))
  }
  if (cmd != null) {
    if (!bot.cooldowns.has(command)) {
      bot.cooldowns.set(command, new Collection())
    }
    let cooldown = cmd.conf.cooldown || false
    let cooldownAmount
    const now = Date.now()
    const timestamps = bot.cooldowns.get(command)
    if (cooldown) {
      cooldownAmount = (cooldown) * 1000
      if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount
  
        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000
          const embed = new MessageEmbed()
            .setColor(message.member.roles.highest.color)
            .addField(':watch: On cooldown!' ,`You're still on cooldown for \`${timeLeft.toFixed(1)}\` more second(s)!`)
          bot.logger.log('info', `${chalk.green(`${message.author.username}#${message.author.discriminator} (${message.author.id})`)} just ran ${chalk.green(getPrefix(message.guild.id) + cmd.conf.name)} in ${chalk.green(message.guild.name + ` (${message.guild.id})`)} but was on cooldown for ${timeLeft.toFixed(1)} more seconds.`)
          return message.reply(embed)
        }
      }
    }
    try {
      if (cfg.get(`${message.guild.id}.disabledModules`)) {
        if (cfg.get(`${message.guild.id}.disabledModules`).includes(cmd.conf.category)) {
          return
        }
      }
      if (cfg.get(`${message.guild.id}.disabledCommands`)) {
        if (cfg.get(`${message.guild.id}.disabledCommands`).includes(cmd.conf.name)) {
          return
        }
      }      
      const result = cmd.run(bot, message, args)
      if (result && cooldown) timestamps.set(message.author.id, now)
      bot.logger.log('info', `${chalk.green(`${message.author.username}#${message.author.discriminator} (${message.author.id})`)} just ran ${chalk.green(getPrefix(message.guild.id) + cmd.conf.name)} in ${chalk.green(message.guild.name + ` (${message.guild.id}).`)}`)
      if (cooldown) {
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount)
      }
    } catch (e) {
      console.error(e)
    }
  }
}