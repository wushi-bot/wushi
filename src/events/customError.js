
import { MessageEmbed, MessageAttachment } from 'discord.js'

exports.run = async (bot, error, message) => {
  const embed = new MessageEmbed()
    .setColor(message.member.roles.highest.color)
    .addField('<:cross:821028198330138644> Error!', 'An error occured, you may have to join the [support server](https://discord.gg/zjqeYbNU5F) to get this resolved.')
    .addField('<:info:820704940682510449> Error Message', error)
  message.reply(embed)
}