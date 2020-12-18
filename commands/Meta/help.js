import { MessageEmbed } from 'discord.js'
import Command from '../../models/Command'
import utils from '../../utils/utils'

class HelpCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'help',
      description: 'Lists help on what to do on the bot.',
      category: 'Meta',
      aliases: ['bot-help', 'wushi'],
      usage: 'help',
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    const embed = new MessageEmbed()
      .setDescription(`:sushi: [**wushi help** v${this.client.version}](https://wushibot.xyz)\n───────────────────────\n • Come visit the [dashboard](https://wushibot.xyz)!\n • Get a list of commands using [this page](https://docs.wushibot.xyz) or \`${utils.getPrefix(`${msg.guild.id}`)}commands\`!\n • Join the [support server](https://discord.gg/zwmqwjrxR9)!\n • Invite me to your server using [this URL](https://discord.com/oauth2/authorize?client_id=${this.client.user.id}&permissions=1275456512&scope=bot).`)
      .setColor('#ff3f38')
    msg.channel.send(embed)
  }
}

module.exports = HelpCommand
