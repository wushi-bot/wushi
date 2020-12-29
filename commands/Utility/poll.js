import { MessageEmbed } from 'discord.js'
import Command from '../../models/Command'
import numWords from 'num-words'
import emoji from 'node-emoji'
import utils from '../../utils/utils'

class PollCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'poll',
      description: 'Start a poll with some questios.',
      category: 'Util',
      aliases: ['pol'],
      usage: 'poll question</>answer:answer',
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    if (!args[0]) {
      const embed = new MessageEmbed()
        .setAuthor(msg.author.tag, msg.author.avatarURL())
        .setDescription(`❌ You must add your choices for the poll with : dividers, for example \`${utils.getPrefix(msg.guild.id)}poll How is everyone's days?</>Good!:Bad!\``)
        .setColor('#0099ff')
      return msg.channel.send(embed)
    }
    const bigString = (args.join(' ').split('<>').pop().split('</>')[0]).replace('</>', '')
    const chs = args.join(' ').split(bigString)[1].replace('</>', '')

    if (chs) {
      if (chs.includes(':') && chs.split(':')) {
        const choices = chs.split(':')
        let description = `**${bigString}**\n Pick an option using the reactions below the message.\n`
        choices.forEach((choice, index) => {
          if ((index + 1) === 10) description += `\n:keycap_${numWords(index + 1)}:  ${choice}`
          else if ((index + 1) < 10) description += `\n:${numWords(index + 1)}:  ${choice}`
        })

        const embed = new MessageEmbed()
          .setAuthor(msg.author.tag, msg.author.avatarURL())
          .setColor('#0099ff')
          .setTitle(`📊 Poll started by ${msg.author.username}`)
          .setDescription(`${description}`)
        msg.channel.send(embed).then(message => {
          [...Array(choices.length)].map((_, i) => {
            if ((i + 1) === 10) {
              message.react(emoji.emojify(`:keycap_${numWords(i + 1)}:`))
            } else if ((i + 1) < 10) {
              message.react(emoji.emojify(`:${numWords(i + 1)}:`))
            }
          })
        })
      } else {
        const embed = new MessageEmbed()
          .setAuthor(msg.author.tag, msg.author.avatarURL())
          .setDescription(`❌ You must add your choices for the poll with : dividers, for example \`${utils.getPrefix(msg.guild.id)}poll How is everyone's days?</>Good!:Bad!\``)
          .setColor('#0099ff')
        msg.channel.send(embed)
      }
    } else {
      const embed = new MessageEmbed()
        .setAuthor(msg.author.tag, msg.author.avatarURL())
        .setDescription(`❌ You must add your choices for the poll with : dividers, for example \`${utils.getPrefix(msg.guild.id)}poll How is everyone's days?</>Good!:Bad!\``)
        .setColor('#0099ff')
      msg.channel.send(embed)
    }
  }
}

module.exports = PollCommand
