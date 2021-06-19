import Command from '../../classes/Command'
import { MessageEmbed, MessageActionRow, MessageButton } from 'discord.js'
 
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
    const row = new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setLabel('top.gg')
        .setURL('https://top.gg/bot/755526238466080830/vote')
        .setStyle('LINK'),
      new MessageButton()
        .setLabel('discordbotlist.com')
        .setURL('https://discordbotlist.com/bots/wushi/upvote')
        .setStyle('LINK'),
    );
    const e = new MessageEmbed() 
      .addField(':money_with_wings: Rewards', '+ :coin: **750**\n+ **1%** while you have the bot upvoted\n+ ...and access to various commands.')
      .setColor(color)
    msg.reply({ embeds: [e], components: [row], ephemeral: true })
    return true
  }
}

module.exports = VoteCommand