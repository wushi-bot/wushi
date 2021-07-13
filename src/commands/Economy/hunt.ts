
import Command from '../../classes/Command'
import { MessageEmbed, MessageActionRow, MessageButton } from 'discord.js'
import { getRandomInt, getPrefix, addCommas, getItem, allItems } from '../../utils/utils'
import { addMoney, addExp } from '../../utils/economy'
import romanizeNumber from 'romanize-number'
import db from 'quick.db'

const eco = new db.table('economy')
const cfg = new db.table('config')

async function getLoot(crop: string) {
  let odds = getRandomInt(1, 100)
  let list = []
  if (crop === 'rabbit') {
    if (odds > 40) list.push('trap')
    odds = getRandomInt(1, 100)
    if (odds > 60) list.push('leave')
    odds = getRandomInt(1, 100)
    if (odds > 85) list.push('carrot')
  } else if (crop === 'pig') {
    if (odds > 20) list.push('trap')
    odds = getRandomInt(1, 100)
    if (odds > 10) list.push('leave')
    odds = getRandomInt(1, 100)
    if (odds > 60) list.push('seeds')
    odds = getRandomInt(1, 100)
    if (odds > 70) list.push('string')
    odds = getRandomInt(1, 100)
    if (odds > 90) list.push('fishing_bait')    
  } else if (crop === 'deer') {
    if (odds > 20) list.push('trap')
    odds = getRandomInt(1, 100)
    if (odds > 10) list.push('string')
    odds = getRandomInt(1, 100)
    if (odds > 60) list.push('leave')
    odds = getRandomInt(1, 100)
    if (odds > 70) list.push('dirt')
    if (odds > 20) list.push('seeds')
  }
  return list
}

class HuntCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'hunt',
      description: 'Hunt to get stuff!',
      category: 'Economy',
      aliases: ['shoot'],
      usage: 'hunt',
      cooldown: 12.5
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
      this.client.emit('customError', `You need a rifle to hunt, purchase one on the store using \`${getPrefix(msg.guild.id)}buy flimsy_rifle\`.`, msg)
      return false
    }
    const filter = i => {
      if (i.user.id !== msg.author.id) return false
      if (i.customID === 'pig' || i.customID === 'deer' || i.customID === 'rabbit') return true
    }
    let correctChoice = getRandomInt(1, 4)
    let correctDisplay 
    if (correctChoice === 1) {
      correctChoice = 'pig'
      correctDisplay = '🐷 Pig'
    } else if (correctChoice === 2) {
      correctChoice = 'rabbit'
      correctDisplay = '🐰 Rabbit'
    } else if (correctChoice === 3) {
      correctChoice = 'deer'
      correctDisplay = '🦌 Deer'

    }
    const exp = eco.get(`${msg.author.id}.skills.hunting.exp`)
    let bar
    let barItem
    if (eco.get(`${msg.author.id}.skills.hunting.exp`) !== 0) {
      bar = Math.ceil(exp / 10)
      barItem = '▇'
    } else {
      bar = 1
      barItem = '**🗙**'
    }
    const chooserEmbed = new MessageEmbed()
      .setColor(color)
      .setFooter('You have 8 seconds to pick an animal to hunt.')
      .setTitle('🐇 Hunting')
      .setDescription(`**:map: Available animals**\n The **${correctDisplay}** is the only available animal to hunt. \n\n:question: **How to hunt**\nPlease choose a location to hunt at from the corresponding bottom animals.\n\n**:diamond_shape_with_a_dot_inside: Progress**\n:rabbit2: Hunting [ ${barItem.repeat(bar)} ] (Level **${romanizeNumber(eco.get(`${msg.author.id}.skills.hunting.level`))}**) (**${Math.floor(eco.get(`${msg.author.id}.skills.hunting.exp`) / eco.get(`${msg.author.id}.skills.hunting.req`) * 100)}**%)`)
      const row = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setLabel('Rabbit')
            .setCustomID('rabbit')
            .setEmoji('🐰')
            .setStyle('SECONDARY'),
          new MessageButton()
            .setLabel('Pig')
            .setCustomID('pig')
            .setEmoji('🐷')
            .setStyle('SECONDARY'),   
          new MessageButton()
            .setLabel('Deer')
            .setCustomID('deer')
            .setEmoji('🦌')
            .setStyle('SECONDARY'),  
    )
    const message = await msg.reply({ embeds: [chooserEmbed], components: [row] })
    await message.awaitMessageComponentInteraction(filter, { max: 1, time: 8000, errors: ['time'] })
      .then(async interaction => {
        let bonus = 0
        let goldEggChance = 0
        if (items['flimsy_rifle']) {
          goldEggChance = 7.5
          bonus = bonus + 0
        } 
        if (items['decent_rifle']) {
          goldEggChance = 25.5
          bonus = bonus + getRandomInt(7, 15)
        } 
        if (items['great_rifle']) {
          goldEggChance = 60
          bonus = bonus + getRandomInt(25, 35)
        }
        const odds = getRandomInt(0, 100)
        let goldEgg = false
        if (odds < goldEggChance) {
          goldEgg = true
        } else {
          goldEgg = false
        }
        let choice = interaction.customID

        if (choice === 'pig') choice = '🐷 Pig'
        else if (choice === 'deer') choice = '🦌 Deer'
        else if (choice === 'rabbit') choice = '🐰 Rabbit'
        if (correctDisplay !== choice) {
          const embed = new MessageEmbed()
            .addField(':rabbit2: Hunting', 'Incorrect choice! You will not get any **hunting loot / EXP**!')
            .setColor(color)
          return msg.reply({ embeds: [embed] })
        }
        const followUpEmbed = new MessageEmbed()
          .setColor(color) 
          .addField(':rabbit2: Hunting', `Hunting for **${choice}**... please wait...`)
        await interaction.update({ embeds: [followUpEmbed], components: [] })
        setTimeout(async () => {
          let trapBonus
          let loot = await getLoot(interaction.customID)
          if (items['trap']) {
            if (eco.get(`${msg.author.id}.items.trap`) === 0) eco.delete(`${msg.author.id}.items.trap`) 
            else eco.subtract(`${msg.author.id}.items.trap`, 1)
            bonus = bonus + getRandomInt(3, 10)
            trapBonus = true
          }
          const goldEggBonus = getRandomInt(45, 175)
          let amount = getRandomInt(2, 8)
          let lvl = eco.get(`${msg.author.id}.skills.hunting.level`) || 0
          let animalsHunted = Math.floor(amount + amount * (lvl * 0.1))
          amount = addMoney(msg.author.id, Math.floor(amount + amount * (lvl * 0.1)))
          const embed = new MessageEmbed()
            .setColor(color)
          let lootDisplay = []
          loot.forEach(item => {
            let i = getItem(allItems(), item)
            if (eco.get(`${msg.author.id}.items.${i.id}`)) eco.add(`${msg.author.id}.items.${i.id}`, 1)
            else eco.set(`${msg.author.id}.items.${i.id}`, 1)
            lootDisplay.push(`${i.emoji} **${i.display}**`)
          })
          if (eco.get(`${msg.author.id}.items.${interaction.customID}`)) eco.add(`${msg.author.id}.items.${interaction.customID}`, animalsHunted)
          else eco.set(`${msg.author.id}.items.${interaction.customID}`, animalsHunted)
          if (!goldEggBonus) {
            embed.addField(':rabbit2: Hunting', `You hunted for **${getRandomInt(1, 10)} hours**, here's what you got for game!`)
            lootDisplay.push(`${animalsHunted} ${correctDisplay} **(+${bonus})**`)
            embed.addField(':tada: Rewards', `+ ` + lootDisplay.join('\n+ '))
          } else {
            embed.addField(':rabbit2: Hunting', `You hunted for **${getRandomInt(1, 10)} hours**, here's what you got for game!`)
            lootDisplay.push(`${animalsHunted} ${correctDisplay} ***(+${bonus})***`)
            embed.addField(':tada: Rewards', `+ ` + lootDisplay.join('\n+ '))
          }
          if (goldEgg) {
            addMoney(msg.author.id, goldEggBonus)
            embed.addField(':sparkles: Lucky!', `You also found gold! You get :coin: **${goldEggBonus}** as a bonus.`)
          }
          addExp(msg.author, 'hunting', msg)
          embed.addField(':diamond_shape_with_a_dot_inside: Progress', `:trident: **EXP** needed until next level up: **${Math.floor(eco.get(`${msg.author.id}.skills.hunting.req`) - eco.get(`${msg.author.id}.skills.hunting.exp`))}**`)
          const filter2 = i => i.customID === 'hunt' && i.user.id === msg.author.id
          const row2 = new MessageActionRow()
            .addComponents(
              new MessageButton()
                .setLabel('Hunt again?')
                .setCustomID('hunt')
                .setEmoji('🐇')
                .setStyle('SECONDARY'),   
          )
          message.edit({ embeds: [embed], components: [row2] })
          message.awaitMessageComponentInteraction(filter2, { time: 15000 })
          .then(async i => {
            const cmd = this.client.commands.get('hunt')
            await i.update({ components: [] })
            await cmd.run(this.client, msg, args)
          })
          .catch(() => {
            message.edit({ embeds: [embed], components: [] })
          })
        }, 3000)
      })
      .catch(error => {
        console.error(error)
      })
    return true
  }
}

module.exports = HuntCommand