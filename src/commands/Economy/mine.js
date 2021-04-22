import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js'
import utils from '../../utils/utils'
import ecoUtils from '../../utils/economy'
import db from 'quick.db'

const eco = new db.table('economy')

class MineCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'mine',
      description: 'Mine for coins!',
      category: 'Economy',
      aliases: ['pickaxe'],
      usage: 'mine',
      cooldown: 10
    })
  }

  async run (bot, msg, args) {
    if (!eco.get(`${msg.author.id}.started`)) {
      return this.client.emit('customError', 'You don\'t have a bank account!', msg)
    }
    const items = eco.get(`${msg.author.id}.items`) || []
    if (
      !items.includes('flimsy_pickaxe') && 
      !items.includes('decent_pickaxe') && 
      !items.includes('great_pickaxe')
    ) {
      return this.client.emit('customError', `You need a pickaxe to mine, purchase one on the store using \`${utils.getPrefix(msg.guild.id)}buy flimsy_pickaxe\`.`, msg)
    }
    const profitablePlaces = utils.getRandomInt(1, 4)
    let correctChoice
    let bonus 
    const filter = m => m.author.id == msg.author.id && m.content.toLowerCase() === 'mountains' || m.content.toLowerCase() === 'caverns' || m.content.toLowerCase() === 'river'

    const chooserEmbed = new MessageEmbed()
      .setColor(msg.member.roles.highest.color)
      .setTitle(':pick: Mining')
      .setFooter('You have 8 seconds to pick a location.')
    if (profitablePlaces === 1) {
      chooserEmbed.addField('Most Profitable: Mountains :mountain_snow:', 'Choose a location to mine at: `Mountains`, `Caverns`, `River`. Send your choice in chat, picking the correct location will allow you to receive more bonus minerals!')
      correctChoice = 'mountains'
    } else if (profitablePlaces === 2) {
      chooserEmbed.addField('Most Profitable: Caverns :rock:', 'Choose a location to mine at: `Mountains`, `Caverns`, `River`. Send your choice in chat, picking the correct location will allow you to receive more bonus minerals!')
      correctChoice = 'caverns'
    } else if (profitablePlaces === 3) {
      chooserEmbed.addField('Most Profitable: River :ocean:', 'Choose a location to mine at: `Mountains`, `Caverns`, `River`. Send your choice in chat, picking the correct location will allow you to receive more bonus minerals!')
      correctChoice = 'river'
    }
    await msg.reply(chooserEmbed)

    await msg.channel.awaitMessages(filter, { max: 1, time: 8000, errors: ['time'] })
      .then(collected => {
        const choice = collected.first()
        if (choice.content.toLowerCase() === correctChoice) {
          bonus = utils.getRandomInt(2, 10)
          const quizResult = new MessageEmbed()
            .setColor(msg.member.roles.highest.color) 
            .addField(':pick: Mining', `**Correct choice!** You will get **+${bonus}** bonus minerals!`)
          collected.first().reply(quizResult)
        } else {
          bonus = 0
          const quizResult = new MessageEmbed()
            .setColor(msg.member.roles.highest.color) 
            .addField(':pick: Mining', `**Incorrect choice!** You will get no bonus minerals!`)
          collected.first().reply(quizResult)
        }
        let goldChance = 0
        if (eco.get(`${msg.author.id}.items`).includes('flimsy_pickaxe')) {
          goldChance = 2.5
        } 
        if (eco.get(`${msg.author.id}.items`).includes('decent_pickaxe')) {
          goldChance = 7.5
        } 
        if (eco.get(`${msg.author.id}.items`).includes('great_pickaxe')) {
          goldChance = 12
        }
        const odds = utils.getRandomInt(0, 100)
        let gold = false
        if (odds < goldChance) {
          gold = true
        } else {
          gold = false
        }

        if (eco.get(`${msg.author.id}.items`).includes('flimsy_pickaxe')) {
          bonus = bonus + 0
        } 
        if (eco.get(`${msg.author.id}.items`).includes('decent_pickaxe')) {
          bonus = bonus + utils.getRandomInt(5, 10)
        } 
        if (eco.get(`${msg.author.id}.items`).includes('great_pickaxe')) {
          bonus = bonus + utils.getRandomInt(12, 18)
        }

        let diviningRodBonus
        if (eco.get(`${msg.author.id}.items`).includes('divining_rod')) {
          let i = utils.removeA(eco.get(`${msg.author.id}.items`), 'divining_rod')
          eco.set(`${msg.author.id}.items`, i)
          bonus = bonus + utils.getRandomInt(3, 10)
          diviningRodBonus = true
        }
        const goldBonus = utils.getRandomInt(100, 400)
        let mineralMined
        if (eco.get(`${msg.author.id}.items`).includes('flimsy_pickaxe')) {
          mineralMined = utils.getRandomInt(1, 12)
        } 
        if (eco.get(`${msg.author.id}.items`).includes('decent_pickaxe')) {
          mineralMined = utils.getRandomInt(9, 32)
        } 
        if (eco.get(`${msg.author.id}.items`).includes('great_pickaxe')) {
          mineralMined = utils.getRandomInt(20, 38)
        }
        let profit = 0
        for (let int = 0; int < mineralMined + bonus; int++) {
          let amount = utils.getRandomInt(10, 15)
          eco.add(`${msg.author.id}.balance`, amount)
          profit = profit + amount
        }

        const embed = new MessageEmbed()
          .setColor(msg.member.roles.highest.color)
        if (!diviningRodBonus) {
          embed.addField(':pick: Mining', `You mined for **${utils.getRandomInt(1, 10)} hours** and got :rock: ${mineralMined} **(+${bonus})**, you made :coin: **${profit}**!`)
        } else {
          embed.addField(':pick: Mining', `You mined for **${utils.getRandomInt(1, 10)} hours** and got :rock: ${mineralMined} ***(+${bonus})***, you made :coin: **${profit}**!`)
        }
        
        if (gold) {
          ecoUtils.addMoney(msg.author.id, goldBonus)
          embed.addField(':sparkles: Lucky!', `You also struck gold! You get :coin: **${goldBonus}** as a bonus.`)
        }
        msg.reply(embed)
      })
      .catch(() => {
        const quizResult = new MessageEmbed()
          .setColor(msg.member.roles.highest.color)
          .addField(':pick: Mining', '**Ran out of time!** You dropped your pickaxe and you can\'t mine for now!')
        msg.reply(quizResult)
      })
  }
}

module.exports = MineCommand