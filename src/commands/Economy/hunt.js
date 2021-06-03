
import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js-light'
import utils from '../../utils/utils'
import ecoUtils from '../../utils/economy'
import db from 'quick.db'

const eco = new db.table('economy')
const cfg = new db.table('config')

class HuntCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'hunt',
      description: 'Hunt to get money!',
      category: 'Economy',
      aliases: ['shoot'],
      usage: 'hunt',
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
      !items['flimsy_rifle'] && 
      !items['decent_rifle'] && 
      !items['great_rifle']
    ) {
      this.client.emit('customError', `You need a rifle to hunt, purchase one on the store using \`${utils.getPrefix(msg.guild.id)}buy flimsy_rifle\`.`, msg)
      return false
    }
    const animalInSeason = utils.getRandomInt(1, 4)
    let correctChoice
    let bonus 
    const filter = m => {
      if (m.author.id === msg.author.id) {
        if (m.content.toLowerCase() === 'rabbit' || m.content.toLowerCase() === 'deer' || m.content.toLowerCase() === 'pig') {
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
      .setTitle(':gun: Hunting')
      .setFooter('You have 8 seconds to pick an animal.')
    if (animalInSeason === 1) {
      chooserEmbed.addField('Animal in Season: Pig :pig:', 'Choose an animal in season to hunt: `Pig`, `Rabbit`, `Deer`. Send your choice in chat, picking the correct location will allow you to receive more bonus game!')
      correctChoice = 'pig'
    } else if (animalInSeason === 2) {
      chooserEmbed.addField('Animal in Season: Rabbit :rabbit:', 'Choose an animal in season to hunt: `Pig`, `Rabbit`, `Deer`. Send your choice in chat, picking the correct location will allow you to receive more bonus game!')
      correctChoice = 'rabbit'
    } else if (animalInSeason === 3) {
      chooserEmbed.addField('Animal in Season: Deer :deer:', 'Choose an animal in season to hunt: `Pig`, `Rabbit`, `Deer`. Send your choice in chat, picking the correct location will allow you to receive more bonus game!')
      correctChoice = 'deer'
    }
    const message = await msg.reply(chooserEmbed)
    await msg.channel.awaitMessages(filter, { max: 1, time: 8000, errors: ['time'] })
      .then(collected => {
        const choice = collected.first()
        if (choice.content.toLowerCase() === correctChoice) {
          bonus = utils.getRandomInt(5, 15)
          const quizResult = new MessageEmbed()
            .setColor(color) 
            .addField(':gun: Hunting', `**Correct choice!** You will get **+${bonus}** bonus game!`)
          message.edit(quizResult)
        } else {
          bonus = 0
          const quizResult = new MessageEmbed()
            .setColor(color) 
            .addField(':gun: Hunting', `**Incorrect choice!** You will get no bonus game!`)
          message.edit(quizResult)
        }
        let goldenGooseChance = 0
        if (items['flimsy_rifle']) {
          goldenGooseChance = 12.5
        } 
        if (items['decent_rifle']) {
          goldenGooseChance = 35.5
        } 
        if (items['great_rifle']) {
          goldenGooseChance = 67
        }
        const odds = utils.getRandomInt(0, 100)
        let goldenGoose = false
        if (odds < goldenGooseChance) {
          goldenGoose = true
        } else {
          goldenGoose = false
        }
    
        if (items['flimsy_rifle']) {
          bonus = bonus + 0
        } 
        if (items['decent_rifle']) {
          bonus = bonus + utils.getRandomInt(7, 15)
        } 
        if (items['great_rifle']) {
          bonus = bonus + utils.getRandomInt(25, 35)
        }
        let trapBonus
        if (items['trap']) {
          if (eco.get(`${msg.author.id}.items.trap`) === 0) eco.delete(`${msg.author.id}.items.trap`) 
          else eco.subtract(`${msg.author.id}.items.trap`, 1)
          bonus = bonus + utils.getRandomInt(9, 20)
          trapBonus = true
        }
        const goldenGooseBonus = utils.getRandomInt(80, 225)
        let animalsHunted
        if (items['flimsy_rifle']) {
          animalsHunted = utils.getRandomInt(5, 24)
        } 
        if (items['decent_rifle']) {
          animalsHunted = utils.getRandomInt(12, 30)
        } 
        if (items['great_rifle']) {
          animalsHunted = utils.getRandomInt(20, 50)
        }
        let profit = 0
        for (let int = 0; int < animalsHunted + bonus; int++) {
          let amount = utils.getRandomInt(50, 125)
          let lvl = eco.get(`${msg.author.id}.skills.hunting.level`) || 0
          amount = ecoUtils.addMoney(msg.author.id, Math.floor(amount + amount * (lvl * 0.1)))
          profit = profit + amount
        }
        const embed = new MessageEmbed()
          .setColor(color)
        if (!trapBonus) {
          embed.addField(':gun: Hunting', `You hunted for **${utils.getRandomInt(1, 10)} hours** and caught :rabbit: ${animalsHunted} **(+${bonus})**, you made :coin: **${utils.addCommas(Math.floor(profit))}**!`)
        } else {
          embed.addField(':gun: Hunting', `You hunted for **${utils.getRandomInt(1, 10)} hours** and caught :rabbit: ${animalsHunted} ***(+${bonus})***, you made :coin: **${utils.addCommas(Math.floor(profit))}**!`)
        }
        
        if (goldenGoose) {
          ecoUtils.addMoney(msg.author.id, goldenGooseBonus)
          embed.addField(':sparkles: Lucky!', `You also found a **golden goose**, they laid **${utils.getRandomInt(1, 10)} eggs** and you get :coin: **${goldenGooseBonus}** as a bonus.`)
        }
        ecoUtils.addExp(msg.author, 'hunting', msg)
        embed.addField(':diamond_shape_with_a_dot_inside: Progress', `:trident: **EXP** needed until next level up: **${eco.get(`${msg.author.id}.skills.hunting.req`) - eco.get(`${msg.author.id}.skills.hunting.exp`)}**`)
        setTimeout(() => {
          message.edit(embed)
        }, 3000)
        return true
      })
      .catch(() => {
        let goldenGooseChance = 0
        if (items['flimsy_rifle']) {
          goldenGooseChance = 12.5
        } 
        if (items['decent_rifle']) {
          goldenGooseChance = 35.5
        } 
        if (items['great_rifle']) {
          goldenGooseChance = 67
        }
        const odds = utils.getRandomInt(0, 100)
        let goldenGoose = false
        if (odds < goldenGooseChance) {
          goldenGoose = true
        } else {
          goldenGoose = false
        }
    
        if (items['flimsy_rifle']) {
          bonus = bonus + 0
        } 
        if (items['decent_rifle']) {
          bonus = bonus + utils.getRandomInt(7, 15)
        } 
        if (items['great_rifle']) {
          bonus = bonus + utils.getRandomInt(25, 35)
        }
        let trapBonus
        if (items['trap']) {
          if (eco.get(`${msg.author.id}.items.trap`) === 0) eco.delete(`${msg.author.id}.items.trap`) 
          else eco.subtract(`${msg.author.id}.items.trap`, 1)
          bonus = bonus + utils.getRandomInt(9, 20)
          trapBonus = true
        }
        const goldenGooseBonus = utils.getRandomInt(80, 225)
        let animalsHunted
        if (items['flimsy_rifle']) {
          animalsHunted = utils.getRandomInt(5, 24)
        } 
        if (items['decent_rifle']) {
          animalsHunted = utils.getRandomInt(12, 30)
        } 
        if (items['great_rifle']) {
          animalsHunted = utils.getRandomInt(20, 50)
        }
        let profit = 0
        for (let int = 0; int < animalsHunted + bonus; int++) {
          let amount = utils.getRandomInt(50, 125)
          let lvl = eco.get(`${msg.author.id}.skills.hunting.level`) || 0
          amount = ecoUtils.addMoney(msg.author.id, Math.floor(amount + amount * (lvl * 0.1)))
          profit = profit + amount
        }
        const levelUp = ecoUtils.addExp(msg.author, 'hunting')
        const embed = new MessageEmbed()
          .setColor(color)
        if (!trapBonus) {
          embed.addField(':gun: Hunting', `You hunted for **${utils.getRandomInt(1, 10)} hours** and caught :rabbit: ${animalsHunted} **(+${bonus})**, you made :coin: **${utils.addCommas(Math.floor(profit))}**!`)
        } else {
          embed.addField(':gun: Hunting', `You hunted for **${utils.getRandomInt(1, 10)} hours** and caught :rabbit: ${animalsHunted} ***(+${bonus})***, you made :coin: **${utils.addCommas(Math.floor(profit))}**!`)
        }
        
        if (goldenGoose) {
          ecoUtils.addMoney(msg.author.id, goldenGooseBonus)
          embed.addField(':sparkles: Lucky!', `You also found a **golden goose**, they laid **${utils.getRandomInt(1, 10)} eggs** and you get :coin: **${goldenGooseBonus}** as a bonus.`)
        }
        ecoUtils.addExp(msg.author, 'hunting', msg)
        embed.addField(':diamond_shape_with_a_dot_inside: Progress', `:trident: **EXP** needed until next level up: **${eco.get(`${msg.author.id}.skills.hunting.req`) - eco.get(`${msg.author.id}.skills.hunting.exp`)}**`)
        setTimeout(() => {
          message.edit(embed)
        }, 3000)
        return true
      })

  }
}

module.exports = HuntCommand