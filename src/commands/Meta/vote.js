import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js'
 
class VoteCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'vote',
      description: 'Brings the voting link for the bot.',
      category: 'Meta',
      aliases: ['v'],
      usage: 'vote',
      cooldown: 5
    })
  }

  async run (bot, msg, args) {
    const e = new MessageEmbed() 
      .addField('<:wushi:838153134114996255> Vote for wushi!', 'You can vote for wushi to get perks using [this URL](https://top.gg/bot/755526238466080830/vote)!')
      .setColor(msg.member.roles.highest.color)
    msg.reply(e)
  }
}

module.exports = VoteCommand