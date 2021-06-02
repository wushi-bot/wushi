import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js-light'
import romanizeNumber from 'romanize-number'
import db from 'quick.db'

const eco = new db.table('economy') 
const cfg = new db.table('config')

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
    const color = cfg.get(`${msg.author.id}.color`) || msg.member.roles.highest.color
    const user = msg.guild.members.cache.get(args[0]) || msg.mentions.members.first() || msg.member 
    if (!eco.get(`${user.user.id}.started`)) return this.client.emit('customError', `**${user.user.username}** doesn't have a bank account!`, msg)
    let embed
    let message
    if (!eco.get(`${user.user.id}.skills`) && user.user.id === msg.member.user.id) {
      embed = new MessageEmbed()
        .setTitle('No skills found, creating them now...')
        .setColor(color)
      message = await msg.reply(embed)
      eco.set(`${user.user.id}.skills`, {
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
      })
      embed = new MessageEmbed()
        .setTitle('<:check:820704989282172960> Done! Now loading profile...')
        .setColor(color)
      message = await message.edit(embed)
    }
    const list = ['fishing', 'hunting', 'mining', 'farming']
    const finalList = []
    list.forEach(item => {
      const exp = eco.get(`${user.user.id}.skills.${item}.exp`)
      let bar 
      let barItem
      if (eco.get(`${user.user.id}.skills.${item}.exp`) !== 0) {
        bar = Math.ceil(exp / 10)
        barItem = '▇'
      } else {
        bar = 1
        barItem = '**🗙**'
      }
      let finishedBar
      if (item === 'fishing') finishedBar = `:fishing_pole_and_fish: Fishing [ ${barItem.repeat(bar)} ] (Level **${romanizeNumber(eco.get(`${user.user.id}.skills.${item}.level`))}**) (**${Math.floor(eco.get(`${user.user.id}.skills.${item}.exp`) / eco.get(`${user.user.id}.skills.${item}.req`) * 100)}**%)`
      else if (item === 'mining') finishedBar = `:pick: Mining [ ${barItem.repeat(bar)} ] (Level **${romanizeNumber(eco.get(`${user.user.id}.skills.${item}.level`))}**) (**${Math.floor(eco.get(`${user.user.id}.skills.${item}.exp`) / eco.get(`${user.user.id}.skills.${item}.req`) * 100)}**%)`
      else if (item === 'hunting') finishedBar = `:rabbit: Hunting [ ${barItem.repeat(bar)} ] (Level **${romanizeNumber(eco.get(`${user.user.id}.skills.${item}.level`))}**) (**${Math.floor(eco.get(`${user.user.id}.skills.${item}.exp`) / eco.get(`${user.user.id}.skills.${item}.req`) * 100)}**%)`
      else if (item === 'farming') finishedBar = `:seedling: Farming [ ${barItem.repeat(bar)} ] (Level **${romanizeNumber(eco.get(`${user.user.id}.skills.${item}.level`))}**) (**${Math.floor(eco.get(`${user.user.id}.skills.${item}.exp`) / eco.get(`${user.user.id}.skills.${item}.req`) * 100)}**%)`
      finalList.push(finishedBar)
    })
    embed = new MessageEmbed()
      .setTitle(`${user.user.username}'s Skills`)
      .setDescription(finalList.join('\n'))
      .setColor(color)
    if (message) message.edit(embed)
    else msg.reply(embed)
  }
}

module.exports = SkillsCommand