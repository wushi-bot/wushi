import { MessageEmbed, Collection, MessageActionRow, MessageButton } from 'discord.js'
import { checkLevel, getPrefix, getRandomInt } from '../utils/utils' 
import { checkMember, checkGuild } from '../utils/database'
import chalk from 'chalk'
import db from 'quick.db'

import Guild from '../models/Guild'
import Member from '../models/Member'

const tags = new db.table('tags')
const expCooldowns = new Collection()

exports.run = async (bot, message) => {
  if (message.author.bot) return
  let guilds = await Guild.find({
    id: message.guild.id
  }).exec()
  const prefix = await getPrefix(message.guild.id)
  if (guilds.length > 0) {
    if (guilds[0].leveling) {
      checkLevel(message.author.id, message.guild.id)
      if (!message.content.startsWith(prefix)) {
        if (!expCooldowns.has(message.author.id)) {
          const exp = getRandomInt(5, 15)
          await checkMember(message.guild.id, message.author.id, bot)
          const members = await Member.find({
            guildId: message.guild.id,
            userId: message.author.id
          }).exec()
          members[0].exp += exp
          members[0].totalExp += exp
          bot.logger.log('info', `Added ${chalk.green(Math.floor(exp))} exp to ${chalk.green(`${message.author.username}#${message.author.discriminator} (${message.author.id})`)} in ${chalk.green(message.guild.id)}.`)
          if (members[0].expNeeded <= members[0].exp) {
            members[0].level += 1
            members[0].exp -= members[0].expNeeded
            members[0].expNeeded = Math.floor(members[0].expNeeded + (members[0].expNeeded * 0.1))
            members[0].save()
            if (guilds[0].levelUpMessage) { // Fallback to default thingy
              message.channel.send(`Congratulations, **${message.author.username}**, you've leveled :up: to **Level ${members[0].level}**!`)
            } else {
              let lvlMsg = guilds[0].levelUpMessage
              lvlMsg = lvlMsg.replace('{level}', members[0].level)
              lvlMsg = lvlMsg.replace('{user.name}', `${message.author.username}`)
              lvlMsg = lvlMsg.replace('{user.mention}', `<@!${message.author.id}>`)
              lvlMsg = lvlMsg.replace('{user.id}', `${message.author.id}`)
              lvlMsg = lvlMsg.replace('{user.discrim}', `${message.author.discriminator}`)
              lvlMsg = lvlMsg.replace('{nextExp}', members[0].expNeeded)
              message.channel.send(lvlMsg)
            }
          } else {
            members[0].save()
          }
          expCooldowns.set(message.author.id, new Collection())
          setTimeout(() => {
            expCooldowns.delete(message.author.id)
          }, 60000)
        }
      }
    }
  } else {
    checkGuild(bot, message.guild.id)
  }
  if (message.content.startsWith(prefix)) { // @ts-ignore
    const tag = message.content.toLowerCase().split(' ')[0].slice(prefix.length)
    if (tags.get(`${message.guild.id}.${tag}`)) {
      const { content } = tags.get(`${message.guild.id}.${tag}`)
      bot.logger.log('info', `${chalk.green(`${message.author.username}#${message.author.discriminator} (${message.author.id})`)} just ran ${chalk.green(prefix + tag)} (tag) in ${chalk.green(message.guild.name + ` (${message.guild.id}).`)}`)
      return message.channel.send(content)
    }
  }
  if (message.content === `<@!${bot.user.id}>` || message.content === `<@${bot.user.id}>`) {
    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setLabel('Invite')
          .setURL('https://wushibot.xyz/invite')
          .setStyle('LINK'),
        new MessageButton()
          .setLabel('Support')
          .setURL('https://wushibot.xyz/community')
          .setStyle('LINK'),
        new MessageButton()
          .setLabel('Commands')
          .setURL('https://wushibot.xyz/commands')
          .setStyle('LINK'), 
      )
    const embed = new MessageEmbed()
      .setColor('#0099ff')
      .setAuthor(message.author.tag, message.author.avatarURL())
      .setThumbnail(bot.user.avatarURL())
      .setDescription(`Howdy, I'm <@!${bot.user.id}>! My prefix is \`${prefix}\` in this server, do \`${prefix}help\` to see a list of my commands!`)
    return message.channel.send({ embeds: [embed], components: [row] })
    
  }
  if (!message.content.startsWith(prefix)) return // @ts-ignore
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
            bot.logger.log('info', `${chalk.green(`${message.author.username}#${message.author.discriminator} (${message.author.id})`)} just ran ${chalk.green(prefix + cmd.conf.name)} in ${chalk.green(message.guild.name + ` (${message.guild.id})`)} but was on cooldown for ${timeLeft.toFixed(1)} more seconds.`)
          return message.reply({ embeds: [embed] })
        }
      }
    }
    try {
      if (guilds[0].disabledModules) {
        if (guilds[0].disabledModules.includes(cmd.conf.category)) {
          return
        }
      }
      if (guilds[0].disabledCommands) {
        if (guilds[0].disabledCommands.includes(cmd.conf.name)) {
          return
        }
      }      
      const result = await cmd.run(bot, message, args)
      if (result && cooldown) timestamps.set(message.author.id, now)
      bot.logger.log('info', `${chalk.green(`${message.author.username}#${message.author.discriminator} (${message.author.id})`)} just ran ${chalk.green(prefix + cmd.conf.name)} in ${chalk.green(message.guild.name + ` (${message.guild.id}).`)}`)
      if (cooldown) {
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount)
      }
    } catch (e) {
      console.error(e)
    }
  }
}