
import { MessageEmbed, MessageAttachment } from 'discord.js-light'
import utils from '../utils/utils'

exports.run = async (bot, error, message) => {
  const embed = new MessageEmbed()
    .setColor(message.member.roles.highest.color)
    .addField('<:cross:821028198330138644> Error!', error)
    .setFooter(`An error occured, you may have to join the support server via ${utils.getPrefix(message.guild.id)}support to get this resolved.`)
  message.reply(embed)
}