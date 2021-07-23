
import Command from '../../classes/Command'
import { MessageEmbed, MessageActionRow, MessageButton } from 'discord.js'
import { getRandomInt, getPrefix, getColor, getItem, allItems } from '../../utils/utils'
import { addMoney, addExp } from '../../utils/economy'
import romanizeNumber from 'romanize-number'

import User from '../../models/User'

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
      !items['flimsy_rifle'] && 
      !items['decent_rifle'] && 
      !items['great_rifle']
    ) {
      this.client.emit('customError', `You need a rifle to hunt, purchase one on the store using \`${prefix}buy flimsy_rifle\`.`, msg)
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
    const exp = user.skills.hunting.exp
    let bar
    let barItem
    if (user.skills.hunting.exp !== 0) {
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
      .setDescription(`**:map: Available animals**\n The **${correctDisplay}** is the only available animal to hunt. \n\n:question: **How to hunt**\nPlease choose a location to hunt at from the corresponding bottom animals.\n\n**:diamond_shape_with_a_dot_inside: Progress**\n:rabbit2: Hunting [ ${barItem.repeat(bar)} ] (Level **${romanizeNumber(user.skills.hunting.level)}**) (**${Math.floor(user.skills.hunting.exp / user.skills.hunting.req * 100)}**%)`)
      const row = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setLabel('Rabbit')
            .setCustomId('rabbit')
            .setEmoji('🐰')
            .setStyle('SECONDARY'),
          new MessageButton()
            .setLabel('Pig')
            .setCustomId('pig')
            .setEmoji('🐷')
            .setStyle('SECONDARY'),   
          new MessageButton()
            .setLabel('Deer')
            .setCustomId('deer')
            .setEmoji('🦌')
            .setStyle('SECONDARY'),  
    )
    const message = await msg.reply({ embeds: [chooserEmbed], components: [row] })
    await message.awaitMessageComponent({ filter, max: 1, time: 8000, errors: ['time'] })
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
            if (user.items.trap === 0) delete user.items.trap 
            else user.items.trap -= 1
            bonus = bonus + getRandomInt(3, 10)
            trapBonus = true
          }
          const goldEggBonus = getRandomInt(45, 175)
          let amount = getRandomInt(2, 8)
          let lvl = user.skills.hunting.level || 1
          let animalsHunted = Math.floor(amount + amount * (lvl * 0.1))
          amount = addMoney(msg.author.id, Math.floor(amount + amount * (lvl * 0.1)))
          const embed = new MessageEmbed()
            .setColor(color)
          let lootDisplay = []
          loot.forEach(item => {
            let i = getItem(allItems(), item)
            if (user.items[i.id]) user.items[i.id] + 1
            else user.items[i.id] = 1
            lootDisplay.push(`${i.emoji} **${i.display}**`)
          })
          if (user.items[interaction.customID]) user.items[interaction.customID] += animalsHunted
          else user.items[interaction.customID] = animalsHunted
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
          user.save()
          embed.addField(':diamond_shape_with_a_dot_inside: Progress', `:trident: **EXP** needed until next level up: **${Math.floor(user.skills.hunting.req - user.skills.hunting.exp)}**`)
          const filter2 = i => i.customID === 'hunt' && i.user.id === msg.author.id
          const row2 = new MessageActionRow()
            .addComponents(
              new MessageButton()
                .setLabel('Hunt again?')
                .setCustomId('hunt')
                .setEmoji('🐇')
                .setStyle('SECONDARY'),   
          )
          message.edit({ embeds: [embed], components: [row2] })
          message.awaitMessageComponent({ filter2,  time: 15000 })
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