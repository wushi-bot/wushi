import db from 'quick.db'
import Command from '../../classes/Command'
import { MessageEmbed } from 'discord.js'

const cfg = new db.table('config')
const leveling = new db.table('leveling')

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
    const color = cfg.get(`${msg.author.id}.color`) || msg.member.roles.highest.color
    const admins = cfg.get(`${msg.guild.id}.admins`) || []
    const mods = cfg.get(`${msg.guild.id}.mods`) || []
    if (!msg.member.roles.cache.some(role => admins.includes(role.id)) && !msg.member.roles.cache.some(role => mods.includes(role.id)) && !msg.member.permissions.has('ADMINISTRATOR') && !msg.member.permissions.has('MANAGE_GUILD')) {
      this.client.emit('customError', 'You do not have permission to execute this command.', msg)
      return false
    }
    if (!cfg.get(`${msg.guild.id}.leveling`)) {
      this.client.emit('customError', '`Leveling` must be enabled for this action.', msg)
      return false
    }
    if (!args[0]) {
      this.client.emit('customError', 'You must insert a valid level up message.', msg)
      return false
    }
    if (args[0] === 'preview') {
      let lvlMsg = cfg.get(`${msg.guild.id}.levelUpMessage`)
      lvlMsg = lvlMsg || 'Congratulations, **{user.name}**, you\'ve leveled :up: to **Level {level}**!'
      lvlMsg = lvlMsg.replace('{level}', `${leveling.get(`${msg.guild.id}.${msg.author.id}.level`)}`)
      lvlMsg = lvlMsg.replace('{user.name}', `${msg.author.username}`)
      lvlMsg = lvlMsg.replace('{user.mention}', `<@!${msg.author.id}>`)
      lvlMsg = lvlMsg.replace('{user.id}', `${msg.author.id}`)
      lvlMsg = lvlMsg.replace('{user.discrim}', `${msg.author.discriminator}`)
      lvlMsg = lvlMsg.replace('{nextExp}', `${leveling.get(`${msg.guild.id}.${msg.author.id}.expNeeded`)}`)
      const embed = new MessageEmbed()
        .addField(':speech_left: Preview', `Preview: \`${lvlMsg}\`.`)
        .setColor(color)
      msg.reply({ embeds: [embed] })
      return true
    }
    const message = args.join(' ')
    cfg.set(`${msg.guild.id}.levelUpMessage`, message)
    const embed = new MessageEmbed()
      .addField('<:check:820704989282172960> Success!', `The **level up message** in this server has been set to:\n \`\`\`${message}\`\`\`\n`)
      .setColor(color)
    msg.reply({ embeds: [embed] })
    return true
  }
}

module.exports = LevelMessageCommand