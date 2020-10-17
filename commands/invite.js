import { MessageEmbed } from 'discord.js'
import Command from '../models/Command'

class InviteCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'invite',
      description: 'Invite the bot using the provided link.',
      category: 'Meta',
      aliases: ['invite', 'invi', 'invite-bot'],
      usage: 'invite',
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    const embed = new MessageEmbed()
      .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
      .setColor('#0099ff')
      .setDescription(`:sushi: Invite me to your server using [this URL](https://discord.com/oauth2/authorize?client_id=${this.client.user.id}&permissions=1275456512&scope=bot).`)
      .setFooter('Click on "this URL" to open the OAuth2 page to invite the bot.')
    return msg.channel.send(embed)
  }
}

module.exports = InviteCommand
