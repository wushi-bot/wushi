import { MessageEmbed, Collection } from 'discord.js'
import chalk from 'chalk'
import db from 'quick.db'

const cfg = new db.table('config')
const leveling = new db.table('leveling')
const tags = new db.table('tags')
const expCooldowns = new Collection()

exports.run = async (bot, message) => {
  if (message.author.bot) return
  if (message.content.startsWith('+')) {
    const command = message.content.toLowerCase().split(' ')[0].slice('+'.length)
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
            console.log(`${chalk.green(`${message.author.username}#${message.author.discriminator} (${message.author.id})`)} just ran ${chalk.green('+' + cmd.conf.name)} in ${chalk.green(message.guild.name + ` (${message.guild.id})`)} but was on cooldown for ${timeLeft.toFixed(1)} more seconds.`)
            return message.reply({ embeds: [embed] })
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
      const result = await cmd.run(bot, message, args)
      if (result && cooldown) timestamps.set(message.author.id, now)
      console.log(`${chalk.green(`${message.author.username}#${message.author.discriminator} (${message.author.id})`)} just ran ${chalk.green('+' + cmd.conf.name)} in ${chalk.green(message.guild.name + ` (${message.guild.id}).`)}`)
      if (cooldown) {
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount)
      }
      return
    } catch (e) {
      console.error(e)
    }
  }   
  }
}