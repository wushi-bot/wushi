
import Command from '../../classes/Command'
import { MessageEmbed, MessageActionRow, MessageButton } from 'discord.js'
import { getRandomInt, getPrefix, addCommas } from '../../utils/utils'
import { addMoney, addExp } from '../../utils/economy'
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
      this.client.emit('customError', 'You don\'t have a bank account!', msg)
      return false
    }
    const items = eco.get(`${msg.author.id}.items`) || []
    if (
      !items['flimsy_fishing_rod'] && 
      !items['decent_fishing_rod'] && 
      !items['great_fishing_rod']
    ) {
      this.client.emit('customError', `You need a fishing rod to fish, purchase one on the store using \`${getPrefix(msg.guild.id)}buy flimsy_fishing_rod\`.`, msg)
      return false
    }
    const season = getRandomInt(1, 4)
    let correctChoice
    let bonus 
    const filter = i => {
      if (i.user.id !== msg.author.id) return false
      if (i.customID === 'ocean' || i.customID === 'ice_pond' || i.customID === 'lake') return true
    }
    const chooserEmbed = new MessageEmbed()
      .setColor(color)
      .setTitle(':fishing_pole_and_fish: Fishing')
      .setFooter('You have 8 seconds to pick a location.')
    if (season === 1) {
      chooserEmbed.addField('Season: Summer :sunny:', 'Choose a location to fish at: `Ocean`, `Ice Pond`, `Lake`. Picking the correct location will allow you to receive more bonus fish!')
      correctChoice = 'ocean'
    } else if (season === 2) {
      chooserEmbed.addField('Season: Spring :seedling:', 'Choose a location to fish at: `Ocean`, `Ice Pond`, `Lake`. Picking the correct location will allow you to receive more bonus fish!')
      correctChoice = 'lake'
    } else if (season === 3) {
      chooserEmbed.addField('Season: Winter :snowflake:', 'Choose a location to fish at: `Ocean`, `Ice Pond`, `Lake`. Picking the correct location will allow you to receive more bonus fish!')
      correctChoice = 'ice_pond'
    }
    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setLabel('Ocean')
          .setCustomID('ocean')
          .setEmoji('🌊')
          .setStyle('SECONDARY'),
        new MessageButton()
          .setLabel('Lake')
          .setCustomID('lake')
          .setEmoji('🏞️')
          .setStyle('SECONDARY'),   
        new MessageButton()
          .setLabel('Ice Pond')
          .setCustomID('ice_pond')
          .setEmoji('❄️')
          .setStyle('SECONDARY'),  
    )
    const message = await msg.reply({ embeds: [chooserEmbed], components: [row] })
    await message.awaitMessageComponentInteraction(filter, { max: 1, time: 8000, errors: ['time'] })
      .then(interaction => {
        if (interaction.customID.toLowerCase() === correctChoice) {
          bonus = getRandomInt(2, 10)
          const quizResult = new MessageEmbed()
            .setColor(color) 
            .addField(':fishing_pole_and_fish: Fishing', `**Correct choice!** You will get :fish: **+${bonus}** bonus fish!`)
          message.edit({ embeds: [quizResult], components: [] })
        } else {
          bonus = 0
          const quizResult = new MessageEmbed()
            .setColor(color) 
            .addField(':fishing_pole_and_fish: Fishing', `**Incorrect choice!** You will get no bonus fish!`)
          message.edit({ embeds: [quizResult], components: [] })
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
        const odds = getRandomInt(0, 100)
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
          bonus = bonus + getRandomInt(7, 15)
        } 
        if (items['great_fishing_rod']) {
          bonus = bonus + getRandomInt(25, 35)
        }
        let fishingBaitBonus
        if (items['fishing_bait']) {
          if (eco.get(`${msg.author.id}.items.fishing_bait`) === 0) eco.delete(`${msg.author.id}.items.fishing_bait`) 
          else eco.subtract(`${msg.author.id}.items.fishing_bait`, 1)
          bonus = bonus + getRandomInt(3, 10)
          fishingBaitBonus = true
        }
        const goldenReelBonus = getRandomInt(45, 175)
        let fishReeled
        if (items['flimsy_fishing_rod']) {
          fishReeled = getRandomInt(1, 12)
        } 
        if (items['decent_fishing_rod']) {
          fishReeled = getRandomInt(7, 24)
        } 
        if (items['great_fishing_rod']) {
          fishReeled = getRandomInt(9, 27)
        }
        let profit = 0
        for (let int = 0; int < fishReeled + bonus; int++) {
          let amount = getRandomInt(2, 8)
          let lvl = eco.get(`${msg.author.id}.skills.fishing.level`) || 0
          amount = addMoney(msg.author.id, Math.floor(amount + amount * (lvl * 0.1)))
          profit = profit + amount
        }
        const embed = new MessageEmbed()
          .setColor(color)
        if (!fishingBaitBonus) {
          embed.addField(':fishing_pole_and_fish: Fishing', `You fished for **${getRandomInt(1, 10)} hours** and reeled in :fish: ${fishReeled} **(+${bonus})**, you made :coin: **${addCommas(Math.floor(profit))}**!`)
        } else {
          embed.addField(':fishing_pole_and_fish: Fishing', `You fished for **${getRandomInt(1, 10)} hours** and got :fish: ${fishReeled} ***(+${bonus})***, you made :coin: **${addCommas(Math.floor(profit))}**!`)
        }
        
        if (goldenReeling) {
          addMoney(msg.author.id, goldenReelBonus)
          embed.addField(':sparkles: Lucky!', `You also found gold! You get :coin: **${goldenReelBonus}** as a bonus.`)
        }
        addExp(msg.author, 'fishing', msg)
        embed.addField(':diamond_shape_with_a_dot_inside: Progress', `:trident: **EXP** needed until next level up: **${eco.get(`${msg.author.id}.skills.fishing.req`) - eco.get(`${msg.author.id}.skills.fishing.exp`)}**`)
        setTimeout(async () => {
          await message.edit({ embeds: [embed], components: [] })
        }, 3000)
        return true
      })
    .catch(() => {
      const quizResult = new MessageEmbed()
        .setColor(color)
        .addField(':fishing_pole_and_fish: Fishing', '**Ran out of time!** You dropped your fishing pole and you won\'t get a bonus for now!')
      setTimeout(() => {
        message.edit({ embeds: [quizResult] })
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
      const odds = getRandomInt(0, 100)
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
        bonus = bonus + getRandomInt(7, 15)
      } 
      if (items['great_fishing_rod']) {
        bonus = bonus + getRandomInt(25, 35)
      }
      let fishingBaitBonus
      if (items['fishing_bait']) {
        if (eco.get(`${msg.author.id}.items.fishing_bait`) === 0) eco.delete(`${msg.author.id}.items.fishing_bait`) 
        else eco.subtract(`${msg.author.id}.items.fishing_bait`, 1)
        bonus = bonus + getRandomInt(3, 10)
        fishingBaitBonus = true
      }
      const goldenReelBonus = getRandomInt(45, 175)
      let fishReeled
      if (items['flimsy_fishing_rod']) {
        fishReeled = getRandomInt(1, 12)
      } 
      if (items['decent_fishing_rod']) {
        fishReeled = getRandomInt(7, 24)
      } 
      if (items['great_fishing_rod']) {
        fishReeled = getRandomInt(9, 27)
      }
      let profit = 0
      for (let int = 0; int < fishReeled + bonus; int++) {
        let amount = getRandomInt(2, 8)
        let lvl = eco.get(`${msg.author.id}.skills.fishing.level`) || 0
        amount = addMoney(msg.author.id, Math.floor(amount + amount * (lvl * 0.1)))
        profit = profit + amount
      }
      const embed = new MessageEmbed()
        .setColor(color)
        if (!fishingBaitBonus) {
          embed.addField(':fishing_pole_and_fish: Fishing', `You fished for **${getRandomInt(1, 10)} hours** and reeled in :fish: ${fishReeled} **(+${bonus})**, you made :coin: **${addCommas(Math.round(profit))}**!`)
        } else {
          embed.addField(':fishing_pole_and_fish: Fishing', `You fished for **${getRandomInt(1, 10)} hours** and got :fish: ${fishReeled} ***(+${bonus})***, you made :coin: **${addCommas(Math.round(profit))}**!`)
        }
        
        if (goldenReeling) {
          addMoney(msg.author.id, goldenReelBonus)
          embed.addField(':sparkles: Lucky!', `You also found gold! You get :coin: **${goldenReelBonus}** as a bonus.`)
        }
        addExp(msg.author, 'fishing', msg)
        embed.addField(':diamond_shape_with_a_dot_inside: Progress', `:trident: **EXP** needed until next level up: **${Math.floor(eco.get(`${msg.author.id}.skills.fishing.req`) - eco.get(`${msg.author.id}.skills.fishing.exp`))}**`)
        setTimeout(() => {
          message.edit({ embeds: [embed] })
        }, 3000)
        return true
      })

  }
}

module.exports = FishCommand