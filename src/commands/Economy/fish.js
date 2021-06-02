
import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js-light'
import utils from '../../utils/utils'
import ecoUtils from '../../utils/economy'
import db from 'quick.db'

const eco = new db.table('economy')
const cfg = new db.table('config')

class FishCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'fish',
      description: 'Fish to get money!',
      category: 'Economy',
      aliases: ['reel'],
      usage: 'fish',
      cooldown: 10
    })
  }

  async run (bot, msg, args) {
    const color = cfg.get(`${msg.author.id}.color`) || msg.member.roles.highest.color
    if (!eco.get(`${msg.author.id}.started`)) {
      return this.client.emit('customError', 'You don\'t have a bank account!', msg)
    }
    const items = eco.get(`${msg.author.id}.items`) || []
    if (
      !items['flimsy_fishing_rod'] && 
      !items['decent_fishing_rod'] && 
      !items['great_fishing_rod']
    ) {
      return this.client.emit('customError', `You need a fishing rod to fish, purchase one on the store using \`${utils.getPrefix(msg.guild.id)}buy flimsy_fishing_rod\`.`, msg)
    }
    const season = utils.getRandomInt(1, 4)
    let correctChoice
    let bonus 
    const filter = m => {
      if (m.author.id === msg.author.id) {
        if (m.content.toLowerCase() === 'ocean' || m.content.toLowerCase() === 'ice pond' || m.content.toLowerCase() === 'lake') {
          return true
        } else {
          return false
        }
      } else {
        return false
      }
    }
    const chooserEmbed = new MessageEmbed()
      .setColor(color)
      .setTitle(':fishing_pole_and_fish: Fishing')
      .setFooter('You have 8 seconds to pick a location.')
    if (season === 1) {
      chooserEmbed.addField('Season: Summer :sunny:', 'Choose a location to fish at: `Ocean`, `Ice Pond`, `Lake`. Send your choice in chat, picking the correct location will allow you to receive more bonus fish!')
      correctChoice = 'ocean'
    } else if (season === 2) {
      chooserEmbed.addField('Season: Spring :seedling:', 'Choose a location to fish at: `Ocean`, `Ice Pond`, `Lake`. Send your choice in chat, picking the correct location will allow you to receive more bonus fish!')
      correctChoice = 'lake'
    } else if (season === 3) {
      chooserEmbed.addField('Season: Winter :snowflake:', 'Choose a location to fish at: `Ocean`, `Ice Pond`, `Lake`. Send your choice in chat, picking the correct location will allow you to receive more bonus fish!')
      correctChoice = 'ice pond'
    }
    const message = await msg.reply(chooserEmbed)
    await msg.channel.awaitMessages(filter, { max: 1, time: 8000, errors: ['time'] })
      .then(collected => {
        const choice = collected.first()
        if (choice.content.toLowerCase() === correctChoice) {
          bonus = utils.getRandomInt(2, 10)
          const quizResult = new MessageEmbed()
            .setColor(color) 
            .addField(':fishing_pole_and_fish: Fishing', `**Correct choice!** You will get **+${bonus}** bonus fish!`)
          message.edit(quizResult)
        } else {
          bonus = 0
          const quizResult = new MessageEmbed()
            .setColor(color) 
            .addField(':fishing_pole_and_fish: Fishing', `**Incorrect choice!** You will get no bonus fish!`)
          message.edit(quizResult)
        }
        let goldenReelingChance = 0
        if (items['flimsy_fishing_rod']) {
          goldenReelingChance = 7.5
        } 
        if (items['decent_fishing_rod']) {
          goldenReelingChance = 25.5
        } 
        if (items['great_fishing_rod']) {
          goldenReelingChance = 60
        }
        const odds = utils.getRandomInt(0, 100)
        let goldenReeling = false
        if (odds < goldenReelingChance) {
          goldenReeling = true
        } else {
          goldenReeling = false
        }
    
        if (items['flimsy_fishing_rod']) {
          bonus = bonus + 0
        } 
        if (items['decent_fishing_rod']) {
          bonus = bonus + utils.getRandomInt(7, 15)
        } 
        if (items['great_fishing_rod']) {
          bonus = bonus + utils.getRandomInt(25, 35)
        }
        let fishingBaitBonus
        if (items['fishing_bait']) {
          if (eco.get(`${msg.author.id}.items.fishing_bait`) === 0) eco.delete(`${msg.author.id}.items.fishing_bait`) 
          else eco.subtract(`${msg.author.id}.items.fishing_bait`, 1)
          bonus = bonus + utils.getRandomInt(3, 10)
          fishingBaitBonus = true
        }
        const goldenReelBonus = utils.getRandomInt(45, 175)
        let fishReeled
        if (items['flimsy_fishing_rod']) {
          fishReeled = utils.getRandomInt(1, 12)
        } 
        if (items['decent_fishing_rod']) {
          fishReeled = utils.getRandomInt(7, 24)
        } 
        if (items['great_fishing_rod']) {
          fishReeled = utils.getRandomInt(9, 27)
        }
        let profit = 0
        for (let int = 0; int < fishReeled + bonus; int++) {
          let amount = utils.getRandomInt(2, 8)
          let lvl = eco.get(`${msg.author.id}.skills.fishing.level`) || 0
          amount = ecoUtils.addMoney(msg.author.id, Math.floor(amount + amount * (lvl * 0.1)))
          profit = profit + amount
        }
        const embed = new MessageEmbed()
          .setColor(color)
        if (!fishingBaitBonus) {
          embed.addField(':fishing_pole_and_fish: Fishing', `You fished for **${utils.getRandomInt(1, 10)} hours** and reeled in :fish: ${fishReeled} **(+${bonus})**, you made :coin: **${utils.addCommas(Math.floor(profit))}**!`)
        } else {
          embed.addField(':fishing_pole_and_fish: Fishing', `You fished for **${utils.getRandomInt(1, 10)} hours** and got :fish: ${fishReeled} ***(+${bonus})***, you made :coin: **${utils.addCommas(Math.floor(profit))}**!`)
        }
        
        if (goldenReeling) {
          ecoUtils.addMoney(msg.author.id, goldenReelBonus)
          embed.addField(':sparkles: Lucky!', `You also found gold! You get :coin: **${goldenReelBonus}** as a bonus.`)
        }
        ecoUtils.addExp(msg.author, 'fishing')
        embed.addField(':diamond_shape_with_a_dot_inside: Progress', `:trident: **EXP** needed until next level up: **${eco.get(`${msg.author.id}.skills.fishing.req`) - eco.get(`${msg.author.id}.skills.fishing.exp`)}**`)
        setTimeout(() => {
          message.edit(embed)
        }, 3000)
      })
      .catch(() => {
        const quizResult = new MessageEmbed()
          .setColor(color)
          .addField(':fishing_pole_and_fish: Fishing', '**Ran out of time!** You dropped your fishing pole and you won\'t get a bonus for now!')
        setTimeout(() => {
          message.edit(quizResult)
        }, 3000)
        let bonus = 0
        let goldenReelingChance = 0
        if (items['flimsy_fishing_rod']) {
          goldenReelingChance = 7.5
        } 
        if (items['decent_fishing_rod']) {
          goldenReelingChance = 25.5
        } 
        if (items['great_fishing_rod']) {
          goldenReelingChance = 60
        }
        const odds = utils.getRandomInt(0, 100)
        let goldenReeling = false
        if (odds < goldenReelingChance) {
          goldenReeling = true
        } else {
          goldenReeling = false
        }
    
        if (items['flimsy_fishing_rod']) {
          bonus = bonus + 0
        } 
        if (items['decent_fishing_rod']) {
          bonus = bonus + utils.getRandomInt(7, 15)
        } 
        if (items['great_fishing_rod']) {
          bonus = bonus + utils.getRandomInt(25, 35)
        }
        let fishingBaitBonus
        if (items['fishing_bait']) {
          if (eco.get(`${msg.author.id}.items.fishing_bait`) === 0) eco.delete(`${msg.author.id}.items.fishing_bait`) 
          else eco.subtract(`${msg.author.id}.items.fishing_bait`, 1)
          bonus = bonus + utils.getRandomInt(3, 10)
          fishingBaitBonus = true
        }
        const goldenReelBonus = utils.getRandomInt(45, 175)
        let fishReeled
        if (items['flimsy_fishing_rod']) {
          fishReeled = utils.getRandomInt(1, 12)
        } 
        if (items['decent_fishing_rod']) {
          fishReeled = utils.getRandomInt(7, 24)
        } 
        if (items['great_fishing_rod']) {
          fishReeled = utils.getRandomInt(9, 27)
        }
        let profit = 0
        for (let int = 0; int < fishReeled + bonus; int++) {
          let amount = utils.getRandomInt(2, 8)
          let lvl = eco.get(`${msg.author.id}.skills.fishing.level`) || 0
          amount = ecoUtils.addMoney(msg.author.id, Math.floor(amount + amount * (lvl * 0.1)))
          profit = profit + amount
        }
        const embed = new MessageEmbed()
          .setColor(color)
        if (!fishingBaitBonus) {
          embed.addField(':fishing_pole_and_fish: Fishing', `You fished for **${utils.getRandomInt(1, 10)} hours** and reeled in :fish: ${fishReeled} **(+${bonus})**, you made :coin: **${utils.addCommas(Math.round(profit))}**!`)
        } else {
          embed.addField(':fishing_pole_and_fish: Fishing', `You fished for **${utils.getRandomInt(1, 10)} hours** and got :fish: ${fishReeled} ***(+${bonus})***, you made :coin: **${utils.addCommas(Math.round(profit))}**!`)
        }
        
        if (goldenReeling) {
          ecoUtils.addMoney(msg.author.id, goldenReelBonus)
          embed.addField(':sparkles: Lucky!', `You also found gold! You get :coin: **${goldenReelBonus}** as a bonus.`)
        }
        ecoUtils.addExp(msg.author, 'fishing')
        embed.addField(':diamond_shape_with_a_dot_inside: Progress', `:trident: **EXP** needed until next level up: **${eco.get(`${msg.author.id}.skills.fishing.req`) - eco.get(`${msg.author.id}.skills.fishing.exp`)}**`)
        setTimeout(() => {
          message.edit(embed)
        }, 3000)
      })

  }
}

module.exports = FishCommand