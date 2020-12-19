import db from 'quick.db'
import Command from '../../models/Command'
import { MessageEmbed } from 'discord.js'

const cfg = new db.table('config')
const leveling = new db.table('leveling')

class LevelMessageCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'level-message',
      description: 'Change the bot\'s level up message.',
      category: 'Config',
      aliases: ['lvl-msg', 'lm', 'lvl-message'],
      usage: 'level-message <message>',
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    if (!msg.member.hasPermission('ADMINISTRATOR') && !msg.member.hasPermission('MANAGE_GUILD')) {
      return msg.channel.send('You are missing the permission `Administrator` or `Manage Server`.')
    }
    if (cfg.get(`${msg.guild.id}.disabled`).includes('Leveling')) {
      return msg.channel.send(':sparkles: `Leveling` must be enabled for this action.')
    }
    if (!args[0]) return msg.channel.send('You must insert a valid level up message.')
    if (args[0] === 'preview') {
      let lvlMsg = cfg.get(`${msg.guild.id}.levelUpMessage`)
      lvlMsg = lvlMsg.replace('{level}', `${leveling.get(`${msg.guild.id}.${msg.author.id}.level`)}`)
      lvlMsg = lvlMsg.replace('{user.name}', `${msg.author.username}`)
      lvlMsg = lvlMsg.replace('{user.mention}', `<@!${msg.author.id}>`)
      lvlMsg = lvlMsg.replace('{user.id}', `${msg.author.id}`)
      lvlMsg = lvlMsg.replace('{user.discrim}', `${msg.author.discriminator}`)
      lvlMsg = lvlMsg.replace('{nextExp}', `${leveling.get(`${msg.guild.id}.${msg.author.id}.expNeeded`)}`)
      return msg.channel.send('Preview: ' + lvlMsg)
    }
    const message = args.join(' ')
    cfg.set(`${msg.guild.id}.levelUpMessage`, message)
    const embed = new MessageEmbed()
      .setAuthor(msg.author.tag, msg.author.avatarURL())
      .setDescription(`The **level up message** in this server has been set to:\n \`\`\`${message}\`\`\`\nIf you need any help with variables, please [click this URL](https://wushibot.xyz/variables).`)
      .setColor('#0099ff')
    msg.channel.send(embed)
  }
}

module.exports = LevelMessageCommand
