import { MessageEmbed } from 'discord.js-light'
import db from 'quick.db'

const cfg = new db.table('config')

exports.run = async (bot, error, message) => {
  const color = cfg.get(`${message.author.id}.color`) || message.member.roles.highest.color
  const embed = new MessageEmbed()
    .setColor(color)
    .addField('<:cross:821028198330138644> Error!', error)
    .setFooter(`An error occured, you may have to join the support server via .support to get this resolved.`)
  message.reply(embed)
}