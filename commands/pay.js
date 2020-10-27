import discord from 'discord.js'
import db from 'quick.db'
import Command from '../models/Command'
import utils from '../utils/utils'
const eco = new db.table('economy')

class Pay extends Command {
  constructor (client) {
    super(client, {
      name: 'pay',
      description: 'Pays the tagged user with the amount you can give.',
      category: 'Economy',
      usage: 'pay <@user>',
      aliases: ['payuser', 'userpay'],
      cooldown: 0
    })
  }

  async run (bot, msg, args) {
    const mentionedUser = utils.getMember(msg, args[0])
    if (!mentionedUser) {
      const embed = new discord.MessageEmbed()
        .setColor('#ff2d08')
        .setTitle(':x: You must mention a user.')
        .setDescription('Ping a user using `@` to figure out how to pay them.')
      return msg.channel.send(embed)
    } else {
      if (!args[1]) {
        const embed = new discord.MessageEmbed()
          .setColor('#ff2d08')
          .setTitle(':x: You must provide an amount to pay.')
          .setDescription('Please also provide an amount that you actually have.')
        msg.channel.send(embed)
        return
      }
      if (isNaN(args[1])) {
        const embed = new discord.MessageEmbed()
          .setColor('#ff2d08')
          .setTitle(':x: You must provide a **VALID** amount to pay.')
          .setDescription('Please also provide an amount that you actually have.')
        msg.channel.send(embed)
        return
      }
      if (args[1] > eco.get(`${msg.author.id}.balance`)) {
        const embed = new discord.MessageEmbed()
          .setColor('#ff2d08')
          .setTitle(':x: The amount you\'re trying to give is bigger than your balance')
          .setDescription('Please provide an amount that you actually have.')
        msg.channel.send(embed)
        return
      }
      if (mentionedUser === msg.author) {
        const embed = new discord.MessageEmbed()
          .setColor('#ff2d08')
          .setTitle(':x: That\'s you.')
          .setDescription('Please provide an actual person besides yourself to give money to.')
        msg.channel.send(embed)
        return
      }
      if (mentionedUser.bot) {
        const embed = new discord.MessageEmbed()
          .setColor('#ff2d08')
          .setTitle(':x: That\'s a bot.')
          .setDescription('Please provide an actual person besides yourself or a bot to give money to.')
        msg.channel.send(embed)
        return
      }
      if (!eco.get(`${mentionedUser.id}.inventory`)) eco.set(`${mentionedUser.id}.inventory`, [])
      eco.subtract(`${msg.author.id}.balance`, args[1])
      eco.add(`${mentionedUser.id}.balance`, args[1])
      const embed = new discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Transfer Successful')
        .setDescription(`**-${args[1]}** ${msg.author.username} (Balance: ${utils.addCommas(Math.floor(eco.get(`${msg.author.id}.balance`)))}) → **+${args[1]}** ${mentionedUser.username} (Balance: ${utils.addCommas(Math.floor(db.get(`${mentionedUser.id}.balance`)))})`)
      msg.channel.send(embed)
    }
  }
}

module.exports = Pay
