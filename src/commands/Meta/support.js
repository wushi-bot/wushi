import { MessageEmbed } from 'discord.js-light'
import Command from '../../structs/command'

class SupportCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'support',
      description: 'Sends an invite for the support server.',
      aliases: ['sup'],
      category: 'Meta',
      usage: 'support',
      cooldown: 1.5
    })
  }

  async run (bot, msg, args) {
    const embed = new MessageEmbed()
      .setColor(msg.member.roles.highest.color)
      .setTitle(`:sushi: Join wushi support`)
      .setDescription(`Join [wushi support](https://discord.gg/zjqeYbNU5F)`)
    msg.reply(embed)
  }
}

module.exports = SupportCommand