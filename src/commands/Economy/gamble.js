import Command from '../../structs/command'
import utils from '../../utils/utils'
import ecoUtils from '../../utils/economy'
import { MessageEmbed } from 'discord.js'
import db from 'quick.db'

const eco = new db.table('economy')

class GambleCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'gamble',
      description: 'Allows you to gamble a provided amount of money via a dice roll.',
      category: 'Economy',
      aliases: ['bet'],
      usage: 'gamble <amount>',
      cooldown: 15
    })
  }

  async run (bot, msg, args) {
    if (!eco.get(`${msg.author.id}.started`)) return this.client.emit('customError', 'You do not have a bank account!', msg)
    const bet = utils.abbreviationToNumber(args[0]) || undefined
    if (isNaN(bet)) return this.client.emit('customError', 'Invalid bet!', msg)
    else if (bet < 100) return this.client.emit('customError', 'You need to bet at least :coin: **100**.', msg)
    const wushiGamble = utils.getRandomInt(1, 12)
    const yourGamble = utils.getRandomInt(1, 12)

    const embed = new MessageEmbed()
      .setColor(msg.member.roles.highest.color)
    let amount
    if (yourGamble > wushiGamble) {
      amount = ecoUtils.addMoney(msg.author.id, bet * 2)
      embed.addField('<:check:820704989282172960> You win!', `You won the gamble, you earn :coin: **${utils.addCommas(amount)}**!`)
    } else if (yourGamble < wushiGamble) {
      amount = bet
      eco.subtract(`${msg.author.id}.balance`, bet)
      embed.addField('<:cross:821028198330138644> You loss!', `You lost the gamble, you lose :coin: **${utils.addCommas(amount)}**!`)
    } else {
      embed.addField('<:cross:821028198330138644> Draw!', `You both tied to the same score, you win or lose nothing!`)
    }
    embed
      .addField('Wushi Roll', `\`${wushiGamble}\``)
      .addField('Your Roll', `\`${yourGamble}\``)
    msg.reply(embed)
  }
}

module.exports = GambleCommand