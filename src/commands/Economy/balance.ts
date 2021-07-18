import Command from '../../classes/Command'
import { addCommas, getColor, getPrefix } from '../../utils/utils'
import { MessageEmbed } from 'discord.js'
import romanizeNumber from 'romanize-number'
import User from '../../models/User'
import { checkUser } from '../../utils/database'

class BalanceCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'balance',
      description: 'Gets your bank/purse balance.',
      category: 'Economy',
      aliases: ['bal'],
      usage: 'balance [@user]',
      cooldown: 3.5
    })
  }

  async run (bot, msg, args) {
    checkUser(bot, msg.author.id)
    const user = await User.findOne({
      id: msg.author.id
    }).exec()
    const prefix = await getPrefix(msg.guild.id)
    if (!user || !user.started) return this.client.emit('customError', `You don't have a bank account! Create one using \`${prefix}start\`.`, msg)
    const color = await getColor(bot, msg.member)
    const member = msg.guild.members.cache.get(args[0]) || msg.mentions.members.first() || msg.member 
    const bank = user.bank || 0
    const wallet = user.balance || 0
    const prestige = romanizeNumber(user.prestige) || 1)
    const embed = new MessageEmbed()
      .setAuthor(`${member.user.username}'s Balance`, member.user.avatarURL()) 
      .addField(':bank: Bank', `:coin: **${addCommas(bank)}**`, true)
      .addField(':purse: Wallet', `:coin: **${addCommas(wallet)}**`, true)
      .addField(':moneybag: Total', `:coin: **${addCommas(wallet + bank)}**`, true)
      .setFooter(`Prestige: ${prestige}`)
      .setColor(color)
    msg.reply({ embeds: [embed] })
    return true
  }
}

module.exports = BalanceCommand