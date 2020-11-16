import Command from '../models/Command'
import utils from '../utils/utils'
import { MessageEmbed, Collection } from 'discord.js'
import req from '@aero/centra'
import 'dotenv/config'

import db from 'quick.db'
const eco = new db.table('economy')
const votes = new Collection()

class VoteCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'vote',
      description: 'Checks if you\'ve voted for the bot in the last 12 hours.',
      category: 'Meta',
      aliases: [],
      usage: 'vote',
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    const res = await req(`https://top.gg/api/bots/755526238466080830/check?userId=${msg.author.id}`).header('Authorization', process.env.DBL_TOKEN)
    const voteJson = await res.json()
    if (voteJson.voted === 1) {
      if (!votes.has(msg.author.id)) {
        votes.set(msg.author.id, true)

        eco.add(`${msg.author.id}.balance`, 2500)
        eco.push(`${msg.author.id}.items`, 'common_lootbox')
        eco.set(`${msg.author.id}.voted`, true)

        const embed = new MessageEmbed()
          .setAuthor(msg.author.tag, msg.author.avatarURL())
          .setDescription('You have voted for the bot recently & you haven\'t received your rewards yet. Claiming your rewards now...')
          .addField('Rewards', `+ :coin: **2,500 coins**\n+ :package: **1 Common Lootbox** (Use \`${utils.getPrefix(msg.guild.id)}unbox common_lootbox\` to open this lootbox.)`, true)
          .addField('Voting URL', '[Click here](https://top.gg/bot/755526238466080830/vote)', true)
          .setColor('#0099ff')
        msg.channel.send(embed)
        setTimeout(() => {
          if (votes.has(msg.author.id)) {
            votes.delete(msg.author.id)
            eco.set(`${msg.author.id}.voted`, false)
          }
        }, 21600000)
      } else {
        const embed = new MessageEmbed()
          .setAuthor(msg.author.tag, msg.author.avatarURL())
          .setDescription('You have [voted](https://top.gg/bot/755526238466080830/vote) for the bot recently & claimed your rewards.')
          .setColor('#0099ff')
        msg.channel.send(embed)
      }
    } else {
      const embed = new MessageEmbed()
        .setAuthor(msg.author.tag, msg.author.avatarURL())
        .setDescription('You have not voted for the bot recently, vote using this URL and get rewards. ([Click here](https://top.gg/bot/755526238466080830/vote))')
        .addField('Rewards', `+ :coin: **2,500 coins**\n+ :package: **1 Common Lootbox** (Use \`${utils.getPrefix(msg.guild.id)}unbox common_lootbox\` to open this lootbox.)`)
        .setColor('#0099ff')
      msg.channel.send(embed)
    }
  }
}

module.exports = VoteCommand
