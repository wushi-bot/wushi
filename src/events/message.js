import { getPrefix } from '../utils/utils'

exports.run = (bot, message) => {
  if (message.author.bot) return
  const prefix = getPrefix(message.guild.id)
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
    try {
      cmd.run(bot, message, args)
    } catch (e) {
      console.error(e)
    }
  }
}