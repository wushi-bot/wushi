
import Command from '../../classes/Command'
import { MessageEmbed, MessageActionRow, MessageButton } from 'discord.js'
import { getRandomInt, getPrefix, getColor, getItem, allItems } from '../../utils/utils'
import { addMoney, addExp } from '../../utils/economy'
import { checkUser } from '../../utils/database'
import romanizeNumber from 'romanize-number'

import User from '../../models/User'

async function getLoot(crop: string) {
  let odds = getRandomInt(1, 100)
  let list = []
  if (crop === 'carrot') {
    if (odds > 40) list.push('dirt')
    odds = getRandomInt(1, 100)
    if (odds > 60) list.push('leave')
    odds = getRandomInt(1, 100)
    if (odds > 85) list.push('worm')
  } else if (crop === 'tomato') {
    if (odds > 20) list.push('dirt')
    odds = getRandomInt(1, 100)
    if (odds > 10) list.push('leave')
    odds = getRandomInt(1, 100)
    if (odds > 60) list.push('seeds')
    odds = getRandomInt(1, 100)
    if (odds > 70) list.push('string')
    odds = getRandomInt(1, 100)
    if (odds > 90) list.push('fertilizer')    
  } else if (crop === 'corn') {
    if (odds > 20) list.push('weeds')
    odds = getRandomInt(1, 100)
    if (odds > 10) list.push('string')
    odds = getRandomInt(1, 100)
    if (odds > 60) list.push('leave')
    odds = getRandomInt(1, 100)
    if (odds > 70) list.push('dirt')
  }
  return list
}

class FarmCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'farm',
      description: 'Farm to get stuff!',
      category: 'Economy',
      aliases: ['till'],
      usage: 'farm',
      cooldown: 12.5
    })
  }

  async run (bot, msg, args) {
    const color = await getColor(bot, msg.member)
    const user = await User.findOne({
      id: msg.author.id
    }).exec()
    const prefix = await getPrefix(msg.guild.id)
    if (!user || !user.started) {
      this.client.emit('customError', `You don't have a bank account! Create one using \`${prefix}start\`.`, msg)
      return false
    }
    const items = user.items || {}
    if (
      !items['flimsy_hoe'] && 
      !items['decent_hoe'] && 
      !items['great_hoe']
    ) {
      this.client.emit('customError', `You need a hoe to farm, purchase one on the store using \`${prefix}buy flimsy_hoe\`.`, msg)
      return false
    }
    const filter = i => {
      if (i.user.id !== msg.author.id) return false
      if (i.customID === 'carrot' || i.customID === 'corn' || i.customID === 'tomato') return true
    }
    let correctChoice = getRandomInt(1, 4)
    let correctDisplay 
    if (correctChoice === 1) {
      correctChoice = 'carrot'
      correctDisplay = '🥕 Carrot'
    } else if (correctChoice === 2) {
      correctChoice = 'corn'
      correctDisplay = '🌽 Corn'
    } else if (correctChoice === 3) {
      correctChoice = 'tomato'
      correctDisplay = '🍅 Tomato'

    }
    const exp = user.skills.farming.exp || 0
    const level = user.skills.farming.level || 1
    const req = user.skills.farming.req || 100
    let bar
    let barItem
    if (exp !== 0) {
      bar = Math.ceil(exp / 10)
      barItem = '▇'
    } else {
      bar = 1
      barItem = '**🗙**'
    }
    const chooserEmbed = new MessageEmbed()
      .setColor(color)
      .setFooter('You have 8 seconds to pick a crop to harvest.')
      .setTitle(':seedling: Farming')
      .setDescription(`**:map: Crop in Season**\n The **${correctDisplay}** is the correct crop to harvest. \n\n:question: **How to farm**\nPlease choose a location to farm at from the corresponding bottom locations.\n\n**:diamond_shape_with_a_dot_inside: Progress**\n:seedling: Farming [ ${barItem.repeat(bar)} ] (Level **${romanizeNumber(level)}**) (**${Math.floor(exp / req * 100)}**%)`)
      const row = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setLabel('Tomato')
            .setCustomId('tomato')
            .setEmoji('🍅')
            .setStyle('SECONDARY'),
          new MessageButton()
            .setLabel('Corn')
            .setCustomId('corn')
            .setEmoji('🌽')
            .setStyle('SECONDARY'),   
          new MessageButton()
            .setLabel('Carrot')
            .setCustomId('carrot')
            .setEmoji('🥕')
            .setStyle('SECONDARY'),  
    )
    const message = await msg.reply({ embeds: [chooserEmbed], components: [row] })
    await message.awaitMessageComponent({ filter, max: 1, time: 8000, errors: ['time'] })
      .then(async interaction => {
        let bonus = 0
        let goldEggChance = 0
        if (items['flimsy_hoe']) {
          goldEggChance = 7.5
          bonus = bonus + 0
        } 
        if (items['decent_hoe']) {
          goldEggChance = 25.5
          bonus = bonus + getRandomInt(7, 15)
        } 
        if (items['great_hoe']) {
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

        if (choice === 'tomato') choice = '🍅 Tomato'
        else if (choice === 'corn') choice = '🌽 Corn'
        else if (choice === 'carrot') choice = '🥕 Carrot'
        if (correctDisplay !== choice) {
          const embed = new MessageEmbed()
            .addField(':seedling: Farming', 'Incorrect choice! You will not get any **farming loot / EXP**!')
            .setColor(color)
          return msg.reply({ embeds: [embed] })
        }
        const followUpEmbed = new MessageEmbed()
          .setColor(color) 
          .addField(':seedling: Farming', `Harvesting **${choice}**... please wait...`)
        await interaction.update({ embeds: [followUpEmbed], components: [] })
        setTimeout(async () => {
          let fertilizerBonus
          let loot = await getLoot(interaction.customID)
          if (items['fertilizer']) {
            if (user.items.fertilizer === 0) delete user.items.fertilizer
            else user.items.fertilizer -= 1
            bonus = bonus + getRandomInt(3, 10)
            fertilizerBonus = true
          }
          const goldEggBonus = getRandomInt(45, 175)
          let amount = getRandomInt(2, 8)
          let lvl = level || 1
          let cropsGained = Math.floor(amount + amount * (lvl * 0.1))
          amount = addMoney(msg.author.id, Math.floor(amount + amount * (lvl * 0.1)))
          const embed = new MessageEmbed()
            .setColor(color)
          let lootDisplay = []
          loot.forEach(item => {
            let i = getItem(allItems(), item)
            if (user.items[i.id]) user.items[i.id] += 1
            else user.items[i.id] = 1
            lootDisplay.push(`${i.emoji} **${i.display}**`)
          })
          if (user.items[interaction.customID]) user.items[interaction.customID] += cropsGained
          else user.items[interaction.customID] = cropsGained
          if (!goldEggBonus) {
            embed.addField(':seedling: Farming', `You farmed for **${getRandomInt(1, 10)} hours**, here's what you harvested!`)
            lootDisplay.push(`${cropsGained} ${correctDisplay} **(+${bonus})**`)
            embed.addField(':tada: Rewards', `+ ` + lootDisplay.join('\n+ '))
          } else {
            embed.addField(':seedling: Farming', `You farmed for **${getRandomInt(1, 10)} hours**, here's what you harvested!`)
            lootDisplay.push(`${cropsGained} ${correctDisplay} ***(+${bonus})***`)
            embed.addField(':tada: Rewards', `+ ` + lootDisplay.join('\n+ '))
          }
          if (goldEgg) {
            addMoney(msg.author.id, goldEggBonus)
            embed.addField(':sparkles: Lucky!', `You also found gold! You get :coin: **${goldEggBonus}** as a bonus.`)
          }
          await addExp(msg.author, 'farming', msg)
          user.save()
          embed.addField(':diamond_shape_with_a_dot_inside: Progress', `:trident: **EXP** needed until next level up: **${Math.floor(eco.get(`${msg.author.id}.skills.farming.req`) - eco.get(`${msg.author.id}.skills.farming.exp`))}**`)
          const filter2 = i => i.customID === 'farm' && i.user.id === msg.author.id
          const row2 = new MessageActionRow()
            .addComponents(
              new MessageButton()
                .setLabel('Farm again?')
                .setCustomId('farm')
                .setEmoji('🌱')
                .setStyle('SECONDARY'),   
          )
          message.edit({ embeds: [embed], components: [row2] })
          message.awaitMessageComponent({ filter2, time: 15000 })
          .then(async i => {
            const cmd = this.client.commands.get('farm')
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

module.exports = FarmCommand