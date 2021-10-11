import Command from '../../classes/Command'
import { MessageEmbed } from 'discord.js'
import { getPrefix, getColor } from '../../utils/utils'

import Guild from '../../models/Guild'
import Member from '../../models/Member'

class LevelMessageCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'level-message',
      description: 'Change the bot\'s level up message.',
      category: 'Leveling',
      aliases: ['lvl-msg', 'lm', 'lvl-message'],
      usage: 'level-message <message>',
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    const color = await getColor(bot, msg.member)
    const member = await Member.findOne({
      guildId: msg.guild.id,
      userId: msg.author.id
    }).exec()    
    const guild = await Guild.findOne({
      id: msg.guild.id
    }).exec()
    const admins = guild.admins || []
    const mods = guild.mods || []
    if (!msg.member.roles.cache.some(role => admins.includes(role.id)) && !msg.member.roles.cache.some(role => mods.includes(role.id)) && !msg.member.permissions.has('ADMINISTRATOR') && !msg.member.permissions.has('MANAGE_GUILD')) {
      this.client.emit('customError', 'You do not have permission to execute this command.', msg)
      return false
    }
    if (!guild.leveling) {
      this.client.emit('customError', '`Leveling` must be enabled for this action.', msg)
      return false
    }
    if (!args[0]) {
      this.client.emit('customError', 'You must insert a valid level up message.', msg)
      return false
    }
    if (args[0] === 'preview') {
      let lvlMsg = guild.levelUpMessage || 'Congratulations, **{user.name}**, you\'ve leveled :up: to **Level {level}**!'
      let level = member.level || 1
      let expNeeded = member.expNeeded || 100
      lvlMsg = lvlMsg.replace('{level}', `${level}`)
      lvlMsg = lvlMsg.replace('{user.name}', `${msg.author.username}`)
      lvlMsg = lvlMsg.replace('{user.mention}', `<@!${msg.author.id}>`)
      lvlMsg = lvlMsg.replace('{user.id}', `${msg.author.id}`)
      lvlMsg = lvlMsg.replace('{user.discrim}', `${msg.author.discriminator}`)
      lvlMsg = lvlMsg.replace('{nextExp}', `${expNeeded}`)
      const embed = new MessageEmbed()
        .addField(':speech_left: Preview', `Preview: \`${lvlMsg}\`.`)
        .setColor(color)
      msg.reply({ embeds: [embed] })
      return true
    }
    const message = args.join(' ')
    guild.levelUpMessage = message
    guild.save()
    const embed = new MessageEmbed()
      .addField('<:check:820704989282172960> Success!', `The **level up message** in this server has been set to:\n \`\`\`${message}\`\`\`\n`)
      .setColor(color)
    msg.reply({ embeds: [embed] })
    return true
  }
}

module.exports = LevelMessageCommand