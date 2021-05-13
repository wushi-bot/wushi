
import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js'
import utils from '../../utils/utils'
import ecoUtils from '../../utils/economy'
import db from 'quick.db'

const eco = new db.table('economy')

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
    if (!eco.get(`${msg.author.id}.started`)) {
      return this.client.emit('customError', 'You don\'t have a bank account!', msg)
    }
    const items = eco.get(`${msg.author.id}.items`) || []
    if (
      !items.includes('flimsy_fishing_rod') && 
      !items.includes('decent_fishing_rod') && 
      !items.includes('great_fishing_rod')
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
      .setColor(msg.member.roles.highest.color)
      .setTitle(':fishing_pole_and_fish: Fishing')
      .setFooter('You have 8 seconds to pick a location.')
    if (season === 1) {
      chooserEmbed.addField('Season: Summer :sunny:', 'Choose a location to fish at: `Ocean`, `Ice Pond`, `Lake`. Send your choice in chat, picking the correct location will allow you to receive more bonus fish!')
      correctChoice = 'lake'
    } else if (season === 2) {
      chooserEmbed.addField('Season: Spring :seedling:', 'Choose a location to fish at: `Ocean`, `Ice Pond`, `Lake`. Send your choice in chat, picking the correct location will allow you to receive more bonus fish!')
      correctChoice = 'ocean'
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
            .setColor(msg.member.roles.highest.color) 
            .addField(':fishing_pole_and_fish: Fishing', `**Correct choice!** You will get **+${bonus}** bonus fish!`)
          message.edit(quizResult)
        } else {
          bonus = 0
          const quizResult = new MessageEmbed()
            .setColor(msg.member.roles.highest.color) 
            .addField(':fishing_pole_and_fish: Fishing', `**Incorrect choice!** You will get no bonus fish!`)
          message.edit(quizResult)
        }
        let goldenReelingChance = 0
        if (eco.get(`${msg.author.id}.items`).includes('flimsy_fishing_rod')) {
          goldenReelingChance = 7.5
        } 
        if (eco.get(`${msg.author.id}.items`).includes('decent_fishing_rod')) {
          goldenReelingChance = 25.5
        } 
        if (eco.get(`${msg.author.id}.items`).includes('great_fishing_rod')) {
          goldenReelingChance = 60
        }
        const odds = utils.getRandomInt(0, 100)
        let goldenReeling = false
        if (odds < goldenReelingChance) {
          goldenReeling = true
        } else {
          goldenReeling = false
        }
    
        if (eco.get(`${msg.author.id}.items`).includes('flimsy_fishing_rod')) {
          bonus = bonus + 0
        } 
        if (eco.get(`${msg.author.id}.items`).includes('decent_fishing_rod')) {
          bonus = bonus + utils.getRandomInt(7, 15)
        } 
        if (eco.get(`${msg.author.id}.items`).includes('great_fishing_rod')) {
          bonus = bonus + utils.getRandomInt(25, 35)
        }
        let fishingBaitBonus
        if (eco.get(`${msg.author.id}.items`).includes('fishing_bait')) {
          let i = utils.removeA(eco.get(`${msg.author.id}.items`), 'fishing_bait')
          eco.set(`${msg.author.id}.items`, i)
          bonus = bonus + utils.getRandomInt(3, 10)
          fishingBaitBonus = true
        }
        const goldenReelBonus = utils.getRandomInt(45, 175)
        let fishReeled
        if (eco.get(`${msg.author.id}.items`).includes('flimsy_fishing_rod')) {
          fishReeled = utils.getRandomInt(1, 12)
        } 
        if (eco.get(`${msg.author.id}.items`).includes('decent_fishing_rod')) {
          fishReeled = utils.getRandomInt(7, 24)
        } 
        if (eco.get(`${msg.author.id}.items`).includes('great_fishing_rod')) {
          fishReeled = utils.getRandomInt(9, 27)
        }
        let profit = 0
        for (let int = 0; int < fishReeled + bonus; int++) {
          let amount = utils.getRandomInt(2, 8)
          eco.add(`${msg.author.id}.balance`, amount)
          profit = profit + amount
        }
        const embed = new MessageEmbed()
          .setColor(msg.member.roles.highest.color)
        if (!fishingBaitBonus) {
          embed.addField(':fishing_pole_and_fish: Fishing', `You fished for **${utils.getRandomInt(1, 10)} hours** and reeled in :fish: ${fishReeled} **(+${bonus})**, you made :coin: **${profit}**!`)
        } else {
          embed.addField(':fishing_pole_and_fish: Fishing', `You fished for **${utils.getRandomInt(1, 10)} hours** and got :fish: ${fishReeled} ***(+${bonus})***, you made :coin: **${profit}**!`)
        }
        
        if (goldenReeling) {
          ecoUtils.addMoney(msg.author.id, goldenReelBonus)
          embed.addField(':sparkles: Lucky!', `You also found gold! You get :coin: **${goldenReelBonus}** as a bonus.`)
        }
        setTimeout(() => {
          message.edit(embed)
        }, 3000)
      })
      .catch(() => {
        const quizResult = new MessageEmbed()
          .setColor(msg.member.roles.highest.color)
          .addField(':fishing_pole_and_fish: Fishing', '**Ran out of time!** You dropped your fishing pole and you won\'t get a bonus for now!')
        setTimeout(() => {
          message.edit(quizResult)
        }, 3000)
        let bonus = 0
        let goldenReelingChance = 0
        if (eco.get(`${msg.author.id}.items`).includes('flimsy_fishing_rod')) {
          goldenReelingChance = 7.5
        } 
        if (eco.get(`${msg.author.id}.items`).includes('decent_fishing_rod')) {
          goldenReelingChance = 25.5
        } 
        if (eco.get(`${msg.author.id}.items`).includes('great_fishing_rod')) {
          goldenReelingChance = 60
        }
        const odds = utils.getRandomInt(0, 100)
        let goldenReeling = false
        if (odds < goldenReelingChance) {
          goldenReeling = true
        } else {
          goldenReeling = false
        }
    
        if (eco.get(`${msg.author.id}.items`).includes('flimsy_fishing_rod')) {
          bonus = bonus + 0
        } 
        if (eco.get(`${msg.author.id}.items`).includes('decent_fishing_rod')) {
          bonus = bonus + utils.getRandomInt(7, 15)
        } 
        if (eco.get(`${msg.author.id}.items`).includes('great_fishing_rod')) {
          bonus = bonus + utils.getRandomInt(25, 35)
        }
        let fishingBaitBonus
        if (eco.get(`${msg.author.id}.items`).includes('fishing_bait')) {
          let i = utils.removeA(eco.get(`${msg.author.id}.items`), 'fishing_bait')
          eco.set(`${msg.author.id}.items`, i)
          bonus = bonus + utils.getRandomInt(3, 10)
          fishingBaitBonus = true
        }
        const goldenReelBonus = utils.getRandomInt(45, 175)
        let fishReeled
        if (eco.get(`${msg.author.id}.items`).includes('flimsy_fishing_rod')) {
          fishReeled = utils.getRandomInt(1, 12)
        } 
        if (eco.get(`${msg.author.id}.items`).includes('decent_fishing_rod')) {
          fishReeled = utils.getRandomInt(7, 24)
        } 
        if (eco.get(`${msg.author.id}.items`).includes('great_fishing_rod')) {
          fishReeled = utils.getRandomInt(9, 27)
        }
        let profit = 0
        for (let int = 0; int < fishReeled + bonus; int++) {
          let amount = utils.getRandomInt(2, 8)
          eco.add(`${msg.author.id}.balance`, amount)
          profit = profit + amount
        }
        const embed = new MessageEmbed()
          .setColor(msg.member.roles.highest.color)
        if (!fishingBaitBonus) {
          embed.addField(':fishing_pole_and_fish: Fishing', `You fished for **${utils.getRandomInt(1, 10)} hours** and reeled in :fish: ${fishReeled} **(+${bonus})**, you made :coin: **${profit}**!`)
        } else {
          embed.addField(':fishing_pole_and_fish: Fishing', `You fished for **${utils.getRandomInt(1, 10)} hours** and got :fish: ${fishReeled} ***(+${bonus})***, you made :coin: **${profit}**!`)
        }
        
        if (goldenReeling) {
          ecoUtils.addMoney(msg.author.id, goldenReelBonus)
          embed.addField(':sparkles: Lucky!', `You also found gold! You get :coin: **${goldenReelBonus}** as a bonus.`)
        }
        setTimeout(() => {
          message.edit(embed)
        }, 3000)
      })

  }
}

module.exports = FishCommand