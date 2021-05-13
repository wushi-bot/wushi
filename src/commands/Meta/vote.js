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
      .addField('<:wushi:838153134114996255> Vote links for wushi!', '• [discordbotlist.com](https://discordbotlist.com/bots/wushi/upvote)\n • [top.gg](https://top.gg/bot/755526238466080830/vote)')
      .addField(':money_with_wings: Rewards', ':coin: **5,000** & **1%** while you have the bot upvoted, and access to various commands.')
      .setColor(msg.member.roles.highest.color)
    msg.reply(e)
  }
}

module.exports = VoteCommande