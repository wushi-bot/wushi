import Command from '../../models/Command'
import { MessageEmbed } from 'discord.js'
import emoji from 'demoji'
const discordEmojiClient = new emoji.Client()

class EmojiCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'discord-emoji',
      description: 'Gets information from emoji.gg',
      category: 'Util',
      aliases: ['d-emoji', 'dis-emoji'],
      usage: 'discord-emoji [args]',
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    if (!args[0]) {
      const emoji = await discordEmojiClient.random()
      const embed = new MessageEmbed()
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setDescription(`[\`${emoji.title}\`](https://emoji.gg/emoji/${emoji.slug})`)
        .setFooter(`${emoji.faves} ❤️ | Submitted by ${emoji.submitted_by}`)
        .setColor('#0099ff')
        .setImage(`https://emoji.gg/assets/emoji/${emoji.slug}.png`)
      msg.channel.send(embed)
    } else {
      const emoji = await discordEmojiClient.getEmojiByName(args[0]).catch(e => {
        return msg.channel.send(`An error occured: \`${e}\``)
      })
      const embed = new MessageEmbed()
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setDescription(`[\`${emoji.title}\`](https://emoji.gg/emoji/${emoji.slug})`)
        .setFooter(`${emoji.faves} ❤️ | Submitted by ${emoji.submitted_by}`)
        .setColor('#0099ff')
        .setImage(`https://emoji.gg/assets/emoji/${emoji.slug}.png`)
      msg.channel.send(embed)
    }
  }
}

module.exports = EmojiCommand
