import Command from '../../classes/Command'
import { MessageEmbed, MessageActionRow, MessageButton } from 'discord.js'
import { addCommas } from '../../utils/utils' 

import db from 'quick.db'
const cfg = new db.table('config')
const eco = new db.table('economy')

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
    
    const unvotes = eco.get('unvotes') || []
    const topGgVote = unvotes.filter(x => x.user === msg.author.id && x.site === 'topgg')[0]
    const dblVote = unvotes.filter(x => x.user === msg.author.id && x.site === 'discordbotlistcom')[0]

    let topGgButton
    if (topGgVote) {
      topGgButton = new MessageButton()
        .setLabel('top.gg - Already redeemed')
        .setStyle('LINK')
        .setURL('https://top.gg/bot/755526238466080830/vote')
        .setDisabled(true)
    } else {
      topGgButton = new MessageButton()
      .setLabel('top.gg')
      .setURL('https://top.gg/bot/755526238466080830/vote')
      .setStyle('LINK')
    }
 
    let dblButton
    if (dblVote) {
      dblButton = new MessageButton()
        .setLabel('discordbotlist.com - Already redeemed')
        .setStyle('LINK')
        .setURL('https://discordbotlist.com/bots/wushi/upvote')
        .setDisabled(true)
    } else {
      dblButton = new MessageButton()
        .setLabel('discordbotlist.com')
        .setURL('https://discordbotlist.com/bots/wushi/upvote')
        .setStyle('LINK')
    }    

    const row = new MessageActionRow()
      .addComponents(topGgButton, dblButton)
    const e = new MessageEmbed() 
      .setDescription(`:ballot_box: **Voting**\nHelp support :sushi: [wushi](https://wushibot.xyz) by voting the bot today on the provided bot list.\n\n:money_with_wings: **Rewards**\n+ :coin: **${addCommas(Math.floor(750 + (750 * (eco.get(`${msg.author.id}.multiplier`) * 0.1)) * eco.get(`${msg.author.id}.prestige`)))}**\n+ :crown: **1%** Multiplier`)
      .setColor(color)
    msg.reply({ embeds: [e], components: [row] })
    return true
  }
}

module.exports = VoteCommand