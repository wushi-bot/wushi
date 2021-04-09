import { getPrefix } from '../utils/utils'
import { MessageEmbed } from 'discord.js'
import chalk from 'chalk'

exports.run = (bot, message) => {
  if (message.author.bot) return
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
    try {
      cmd.run(bot, message, args)
      bot.logger.log('info', `${chalk.green(`${message.author.username}#${message.author.discriminator} (${message.author.id})`)} just ran ${chalk.green(getPrefix(message.guild.id) + cmd.conf.name)} in ${chalk.green(message.guild.name + ` (${message.guild.id}).`)}`)
    } catch (e) {
      console.error(e)
    }
  }
}