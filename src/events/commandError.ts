import { MessageEmbed, MessageActionRow, MessageButton } from 'discord.js'
import db from 'quick.db'

const cfg = new db.table('config')

exports.run = async (bot, error, message) => {
  const color = cfg.get(`${message.author.id}.color`) || message.member.roles.highest.color
  const row = new MessageActionRow()
  .addComponents(
    new MessageButton()
      .setLabel('Support')
      .setURL('https://wushibot.xyz/community')
      .setStyle('LINK'),   
  )
  const embed = new MessageEmbed()
    .setColor(color)
    .addField('<:cross:821028198330138644> Error!', error)
  message.reply({ embeds: [embed], components: [row] })
}