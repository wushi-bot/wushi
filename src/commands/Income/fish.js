
import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js'
import utils from '../../utils/utils'
import db from 'quick.db'

const eco = new db.table('economy')

class FishCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'fish',
      description: 'Fish to get money!',
      category: 'Income',
      aliases: ['reel'],
      usage: 'fish',
      cooldown: 10
    })
  }

  async run (bot, msg, args) {
    if (!eco.get(`${msg.guild.id}.${msg.author.id}.started`)) {
      return this.client.emit('customError', 'You don\'t have a bank account in the server!', msg)
    }
    const items = eco.get(`${msg.guild.id}.${msg.author.id}.items`) || []
    if (
      !items.includes('flimsy_fishing_rod') && 
      !items.includes('decent_fishing_rod') && 
      !items.includes('great_fishing_rod')
    ) {
      return this.client.emit('customError', `You need a fishing rod to fish, purchase one on the store using \`${utils.getPrefix(msg.guild.id)}buy flimsy_fishing_rod\`.`, msg)
    }
    let goldenReelingChance = 0
    if (eco.get(`${msg.guild.id}.${msg.author.id}.items`).includes('flimsy_fishing_rod')) {
      goldenReelingChance = 7.5
    } else if (eco.get(`${msg.guild.id}.${msg.author.id}.items`).includes('decent_fishing_rod')) {
      goldenReelingChance = 25.5
    } else if (eco.get(`${msg.guild.id}.${msg.author.id}.items`).includes('great_fishing_rod')) {
      goldenReelingChance = 60
    }
    const odds = utils.getRandomInt(0, 100)
    let goldenReeling = false
    if (odds < goldenReelingChance) {
      goldenReeling = true
    } else {
      goldenReeling = false
    }
    let bonus
    if (eco.get(`${msg.guild.id}.${msg.author.id}.items`).includes('flimsy_fishing_rod')) {
      bonus = utils.getRandomInt(1, 5)
    } else if (eco.get(`${msg.guild.id}.${msg.author.id}.items`).includes('decent_fishing_rod')) {
      bonus = utils.getRandomInt(7, 15)
    } else if (eco.get(`${msg.guild.id}.${msg.author.id}.items`).includes('great_fishing_rod')) {
      bonus = utils.getRandomInt(25, 35)
    }
    let fishingBaitBonus
    if (eco.get(`${msg.guild.id}.${msg.author.id}.items`).includes('fishing_bait')) {
      let i = utils.removeA(eco.get(`${msg.guild.id}.${msg.author.id}.items`), 'fishing_bait')
      eco.set(`${msg.guild.id}.${msg.author.id}.items`, i)
      bonus = bonus + utils.getRandomInt(3, 10)
      fishingBaitBonus = true
    }
    const goldenReelBonus = utils.getRandomInt(45, 175)
    const fishReeled = utils.getRandomInt(1, 12)
    for (let int = 0; int < fishReeled; int++) {
      eco.push(`${msg.guild.id}.${msg.author.id}.sack`, 'fish')
    }
    const embed = new MessageEmbed()
      .setColor(msg.member.roles.highest.color)
    if (!fishingBaitBonus) {
      embed.addField(':fishing_pole_and_fish: Fishing', `You fished for **${utils.getRandomInt(1, 10)} hours** and got :fish: ${fishReeled} **(+${bonus})**!`)
    } else {
      embed.addField(':fishing_pole_and_fish: Fishing', `You fished for **${utils.getRandomInt(1, 10)} hours** and got :fish: ${fishReeled} ***(+${bonus})***!`)
    }
    
    if (goldenReeling) {
      eco.add(`${msg.guild.id}.${msg.author.id}.balance`, goldenReelBonus)
      embed.addField(':sparkles: Lucky!', `You also found gold! You get :coin: **${goldenReelBonus}** as a bonus.`)
    }
    msg.reply(embed)
  }
}

module.exports = FishCommand