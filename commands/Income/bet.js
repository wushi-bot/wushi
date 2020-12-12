import Command from '../../models/Command'
import utils from '../../utils/utils'
import { MessageEmbed } from 'discord.js'
import db from 'quick.db'

const eco = new db.table('economy')

class GambleCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'bet',
      description: 'Bet a certain amount of money, has a chance to double.',
      aliases: ['gamble'],
      category: 'Income',
      usage: 'bet [bet]',
      cooldown: 100
    })
  }

  async run (bot, msg, args) {
    if (!eco.get(`${msg.author.id}.started`)) {
      const embed = new MessageEmbed()
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setColor('#f20f0f')
        .setDescription('**Error:** You do not have a bank account!')
      return msg.channel.send(embed)
    }
    if (isNaN(args[0])) {
      const embed = new MessageEmbed()
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setColor('#f20f0f')
        .setDescription('**Error:** Invalid bet!')
      return msg.channel.send(embed)
    } else if (args[0] < 100) {
      const embed = new MessageEmbed()
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setColor('#f20f0f')
        .setDescription('**Error:** You need to bet at least :coin: **100 coins**!')
      return msg.channel.send(embed)
    }
    const wushiGamble = utils.getRandomInt(1, 12)
    const yourGamble = utils.getRandomInt(1, 12)
    const embed = new MessageEmbed()
      .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
      .setColor('#0099ff')
      .setDescription(':game_die: You\'ve started **gambling**...')
    msg.channel.send(embed).then(m => {
      if (yourGamble > wushiGamble) {
        const earnings = args[0] * 2
        eco.add(`${msg.author.id}.balance`, earnings)
        embed
          .addField('New Balance', `:coin: **${utils.addCommas(eco.get(`${msg.author.id}.balance`))}**`, true)
          .addField('Wushi Roll', `\`${wushiGamble}\``, true)
          .addField('Your Roll', `\`${yourGamble}\``, true)
          .setDescription(`:game_die: You won the bet, You've earned :coin: **+${earnings}**!`)
          .setTimestamp()
      } else if (yourGamble < wushiGamble) {
        const loss = args[0]
        eco.subtract(`${msg.author.id}.balance`, loss)
        embed
          .addField('New Balance', `:coin: **${utils.addCommas(eco.get(`${msg.author.id}.balance`))}**`, true)
          .addField('Wushi Roll', `\`${wushiGamble}\``, true)
          .addField('Your Roll', `\`${yourGamble}\``, true)
          .setDescription(`:game_die: You lost the bet, You've lost :coin: **+${loss}**!`)
          .setTimestamp()
      } else {
        embed
          .addField('New Balance', `:coin: **${utils.addCommas(eco.get(`${msg.author.id}.balance`))}**`, true)
          .addField('Wushi Roll', `\`${wushiGamble}\``, true)
          .addField('Your Roll', `\`${yourGamble}\``, true)
          .setDescription(':game_die: You drawed, You lose/win no coins.')
          .setTimestamp()
      }
      setTimeout(() => {
        m.edit(embed)
      }, 3000)
    })
  }
}

module.exports = GambleCommand
