import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js-light'
 
import db from 'quick.db'
const cfg = new db.table('config')

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
    const color = cfg.get(`${msg.author.id}.color`) || msg.member.roles.highest.color
    const e = new MessageEmbed() 
      .addField('<:wushi:838153134114996255> Vote links for wushi!', '• [discordbotlist.com](https://discordbotlist.com/bots/wushi/upvote)\n• [top.gg](https://top.gg/bot/755526238466080830/vote)')
      .addField(':money_with_wings: Rewards', ':coin: **750**, **1%** while you have the bot upvoted, and access to various commands.')
      .setColor(color)
    msg.reply(e)
  }
}

module.exports = VoteCommand