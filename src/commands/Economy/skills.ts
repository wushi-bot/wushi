import Command from '../../classes/Command'
import { MessageEmbed } from 'discord.js'
import romanizeNumber from 'romanize-number'
import { getPrefix, getColor } from '../../utils/utils'

import User from '../../models/User'

class SkillsCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'skills',
      description: 'View your skills',
      category: 'Economy',
      aliases: ['skill'],
      usage: 'skills [@user]',
      cooldown: 2.5
    })
  }

  async run (bot, msg, args) {
    const color = await getColor(bot, msg.member)
    const prefix = await getPrefix(msg.guild.id)
    const member = msg.guild.members.cache.get(args[0]) || msg.mentions.members.first() || msg.member
    const user = await User.findOne({
      id: member.user.id
    }).exec()
    if (!user || !user.started) {
      this.client.emit('customError', `You don't have a bank account! Create one using \`${prefix}start\`.`, msg)
      return false
    }
    let embed
    let message
    if (!user.skills && user.user.id === msg.member.user.id) {
      embed = new MessageEmbed()
        .setTitle('No skills found, creating them now...')
        .setColor(color)
      message = await msg.reply({ embeds: [embed] })
      user.skills = {
        fishing: {
          exp: 0,
          level: 1,
          req: 100
        }, 
        hunting: {
          exp: 0,
          level: 1,
          req: 100
        }, 
        mining: {
          exp: 0,
          level: 1,
          req: 100
        },
        farming: {
          exp: 0,
          level: 1,
          req: 100
        }                
      }
      user.save()
      embed = new MessageEmbed()
        .setTitle('<:check:820704989282172960> Done! Now loading profile...')
        .setColor(color)
      message = await message.edit({ embeds: [embed] })
    }
    const list = ['fishing', 'hunting', 'mining', 'farming']
    const finalList = []
    list.forEach(item => {
      const exp = user.skills[item].exp
      let bar 
      let barItem
      if (user.skills[item].exp !== 0) {
        bar = Math.ceil(exp / 10)
        barItem = '▇'
      } else {
        bar = 1
        barItem = '**🗙**'
      }
      let finishedBar
      if (item === 'fishing') finishedBar = `:fishing_pole_and_fish: Fishing [ ${barItem.repeat(bar)} ] (Level **${romanizeNumber(user.skills[item].level)}**) (**${Math.floor(user.skills[item].exp / user.skills[item].req * 100)}**%)`
      else if (item === 'mining') finishedBar = `:pick: Mining [ ${barItem.repeat(bar)} ] (Level **${romanizeNumber(user.skills[item].level)}**) (**${Math.floor(user.skills[item].exp / user.skills[item].req * 100)}**%)`
      else if (item === 'hunting') finishedBar = `:rabbit: Hunting [ ${barItem.repeat(bar)} ] (Level **${romanizeNumber(user.skills[item].level)}**) (**${Math.floor(user.skills[item].exp / user.skills[item].req * 100)}**%)`
      else if (item === 'farming') finishedBar = `:seedling: Farming [ ${barItem.repeat(bar)} ] (Level **${romanizeNumber(user.skills[item].level)}**) (**${Math.floor(user.skills[item].exp / user.skills[item].req * 100)}**%)`
      finalList.push(finishedBar)
    })
    embed = new MessageEmbed()
      .setTitle(`${member.user.username}'s Skills`)
      .setDescription(finalList.join('\n'))
      .setColor(color)
    if (message) message.edit({ embeds: [embed] })
    else msg.reply({ embeds: [embed] })
    return true
  }
}

module.exports = SkillsCommand