
import Command from '../../classes/Command'
import { MessageEmbed, MessageActionRow, MessageButton } from 'discord.js'
import { getRandomInt, getPrefix, addCommas, getItem, allItems } from '../../utils/utils'
import { addMoney, addExp } from '../../utils/economy'
import romanizeNumber from 'romanize-number'
import db from 'quick.db'

const eco = new db.table('economy')
const cfg = new db.table('config')

async function getLoot(place: string) {
  let odds = getRandomInt(1, 100)
  let list = []
  if (place === 'ice_pond') {
    if (odds > 40) list.push('snowflake')
    odds = getRandomInt(1, 100)
    if (odds > 60) list.push('hunk_of_ice')
    odds = getRandomInt(1, 100)
    if (odds > 85) list.push('divining_rod')
  } else if (place === 'lake') {
    if (odds > 20) list.push('boot')
    odds = getRandomInt(1, 100)
    if (odds > 10) list.push('trap')
    odds = getRandomInt(1, 100)
    if (odds > 60) list.push('fertilizer')
    odds = getRandomInt(1, 100)
    if (odds > 70) list.push('string')
    odds = getRandomInt(1, 100)
    if (odds > 90) list.push('stick')    
  } else if (place === 'ocean') {
    if (odds > 20) list.push('six_pack_ring')
    odds = getRandomInt(1, 100)
    if (odds > 10) list.push('seaweed')
    odds = getRandomInt(1, 100)
    if (odds > 60) list.push('fishing_bait')
    odds = getRandomInt(1, 100)
    if (odds > 70) list.push('metal')
  }
  return list
}

class FishCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'fish',
      description: 'Fish to get stuff!',
      category: 'Economy',
      aliases: ['reel'],
      usage: 'fish',
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
      !items['flimsy_fishing_rod'] && 
      !items['decent_fishing_rod'] && 
      !items['great_fishing_rod']
    ) {
      this.client.emit('customError', `You need a fishing rod to fish, purchase one on the store using \`${getPrefix(msg.guild.id)}buy flimsy_fishing_rod\`.`, msg)
      return false
    }
    const filter = i => {
      if (i.user.id !== msg.author.id) return false
      if (i.customID === 'ocean' || i.customID === 'ice_pond' || i.customID === 'lake') return true
    }
    let correctChoice = getRandomInt(1, 4)
    let correctDisplay 
    if (correctChoice === 1) {
      correctChoice = 'ocean'
      correctDisplay = '🌊 Ocean'
    } else if (correctChoice === 2) {
      correctChoice = 'ice_pond'
      correctDisplay = '❄️ Ice Pond'
    } else if (correctChoice === 3) {
      correctChoice = 'lake'
      correctDisplay = '🏞️ Lake'

    }
    const exp = eco.get(`${msg.author.id}.skills.fishing.exp`)
    let bar
    let barItem
    if (eco.get(`${msg.author.id}.skills.fishing.exp`) !== 0) {
      bar = Math.ceil(exp / 10)
      barItem = '▇'
    } else {
      bar = 1
      barItem = '**🗙**'
    }
    const chooserEmbed = new MessageEmbed()
      .setColor(color)
      .setFooter('You have 8 seconds to pick a location.')
      .setTitle(':fishing_pole_and_fish: Fishing')
      .setDescription(`**:map: Correct Location**\n The **${correctDisplay}** is the correct place to fish at. \n\n:question: **How to fish**\nPlease choose a location to fish at from the corresponding bottom locations.\n\n**:diamond_shape_with_a_dot_inside: Progress**\n:fishing_pole_and_fish: Fishing [ ${barItem.repeat(bar)} ] (Level **${romanizeNumber(eco.get(`${msg.author.id}.skills.fishing.level`))}**) (**${Math.floor(eco.get(`${msg.author.id}.skills.fishing.exp`) / eco.get(`${msg.author.id}.skills.fishing.req`) * 100)}**%)`)
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
      .then(async interaction => {
        let bonus = 0
        let goldenReelingChance = 0
        if (items['flimsy_fishing_rod']) {
          goldenReelingChance = 7.5
          bonus = bonus + 0
        } 
        if (items['decent_fishing_rod']) {
          goldenReelingChance = 25.5
          bonus = bonus + getRandomInt(7, 15)
        } 
        if (items['great_fishing_rod']) {
          goldenReelingChance = 60
          bonus = bonus + getRandomInt(25, 35)
        }
        const odds = getRandomInt(0, 100)
        let goldenReeling = false
        if (odds < goldenReelingChance) {
          goldenReeling = true
        } else {
          goldenReeling = false
        }
        let choice = interaction.customID

        if (choice === 'lake') choice = '🏞️ Lake'
        else if (choice === 'ice_pond') choice = '❄️ Ice Pond'
        else if (choice === 'ocean') choice = '🌊 Ocean'
        if (correctDisplay !== choice) {
          const embed = new MessageEmbed()
            .addField(':fishing_pole_and_fish: Fishing', 'Incorrect choice! You will not get any **fishing loot / EXP**!')
            .setColor(color)
          return msg.reply({ embeds: [embed] })
        }
        const followUpEmbed = new MessageEmbed()
          .setColor(color) 
          .addField(':fishing_pole_and_fish: Fishing', `Fishing at the **${choice}**... please wait...`)
        await interaction.update({ embeds: [followUpEmbed], components: [] })
        setTimeout(async () => {
          let fishingBaitBonus
          let loot = await getLoot(interaction.customID)
          if (items['fishing_bait']) {
            if (eco.get(`${msg.author.id}.items.fishing_bait`) === 0) eco.delete(`${msg.author.id}.items.fishing_bait`) 
            else eco.subtract(`${msg.author.id}.items.fishing_bait`, 1)
            bonus = bonus + getRandomInt(3, 10)
            fishingBaitBonus = true
          }
          const goldenReelBonus = getRandomInt(45, 175)
          let amount = getRandomInt(2, 8)
          let lvl = eco.get(`${msg.author.id}.skills.fishing.level`) || 0
          let fishGained = Math.floor(amount + amount * (lvl * 0.1))
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
          if (eco.get(`${msg.author.id}.items.fish`)) eco.add(`${msg.author.id}.items.fish`, fishGained)
          else eco.set(`${msg.author.id}.items.fish`, fishGained)
          if (!fishingBaitBonus) {
            embed.addField(':fishing_pole_and_fish: Fishing', `You fished for **${getRandomInt(1, 10)} hours**, here's what you fished up!`)
            lootDisplay.push(`${fishGained} :fish: **Fish** **(+${bonus})**`)
            embed.addField(':tada: Rewards', `+ ` + lootDisplay.join('\n+ '))
          } else {
            embed.addField(':fishing_pole_and_fish: Fishing', `You fished for **${getRandomInt(1, 10)} hours**, here's what you fished up!`)
            lootDisplay.push(`${fishGained} :fish: **Fish** ***(+${bonus})***`)
            embed.addField(':tada: Rewards', `+ ` + lootDisplay.join('\n+ '))
          }
          if (goldenReeling) {
            addMoney(msg.author.id, goldenReelBonus)
            embed.addField(':sparkles: Lucky!', `You also found gold! You get :coin: **${goldenReelBonus}** as a bonus.`)
          }
          addExp(msg.author, 'fishing', msg)
          embed.addField(':diamond_shape_with_a_dot_inside: Progress', `:trident: **EXP** needed until next level up: **${Math.floor(eco.get(`${msg.author.id}.skills.fishing.req`) - eco.get(`${msg.author.id}.skills.fishing.exp`))}**`)
          const filter2 = i => i.customID === 'fish' && i.user.id === msg.author.id
          const row2 = new MessageActionRow()
            .addComponents(
              new MessageButton()
                .setLabel('Fish again?')
                .setCustomID('fish')
                .setEmoji('🎣')
                .setStyle('SECONDARY'),   
          )
          message.edit({ embeds: [embed], components: [row2] })
          message.awaitMessageComponentInteraction(filter2, { time: 15000 })
          .then(async i => {
            const cmd = this.client.commands.get('fish')
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

module.exports = FishCommand