
import Command from '../../classes/Command'
import { MessageEmbed, MessageActionRow, MessageButton } from 'discord.js'
import { getRandomInt, getPrefix, getColor, getItem, allItems } from '../../utils/utils'
import { addMoney, addExp } from '../../utils/economy'
import romanizeNumber from 'romanize-number'
import User from '../../models/User'

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
      !items['flimsy_fishing_rod'] && 
      !items['decent_fishing_rod'] && 
      !items['great_fishing_rod']
    ) {
      this.client.emit('customError', `You need a fishing rod to fish, purchase one on the store using \`${prefix}buy flimsy_fishing_rod\`.`, msg)
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
    const exp = user.skills.fishing.exp
    let bar
    let barItem
    if (user.skills.fishing.exp !== 0) {
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
      .setDescription(`**:map: Correct Location**\n The **${correctDisplay}** is the correct place to fish at. \n\n:question: **How to fish**\nPlease choose a location to fish at from the corresponding bottom locations.\n\n**:diamond_shape_with_a_dot_inside: Progress**\n:fishing_pole_and_fish: Fishing [ ${barItem.repeat(bar)} ] (Level **${romanizeNumber(user.skills.fishing.level)}**) (**${Math.floor(user.skills.fishing.exp / user.skills.fishing.req * 100)}**%)`)
      const row = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setLabel('Ocean')
            .setCustomId('ocean')
            .setEmoji('🌊')
            .setStyle('SECONDARY'),
          new MessageButton()
            .setLabel('Lake')
            .setCustomId('lake')
            .setEmoji('🏞️')
            .setStyle('SECONDARY'),   
          new MessageButton()
            .setLabel('Ice Pond')
            .setCustomId('ice_pond')
            .setEmoji('❄️')
            .setStyle('SECONDARY'),  
    )
    const message = await msg.reply({ embeds: [chooserEmbed], components: [row] })
    await message.awaitMessageComponent({ filter, componentType: 'BUTTON', time: 8000 })
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
            if (user.items.fishing_bait === 0) delete user.items.fishing_bait 
            else user.items.fishing_bait -= 1
            bonus = bonus + getRandomInt(3, 10)
            fishingBaitBonus = true
          }
          const goldenReelBonus = getRandomInt(45, 175)
          let amount = getRandomInt(2, 8)
          let lvl = user.skills.fishing.level || 1
          let fishGained = Math.floor(amount + amount * (lvl * 0.1))
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
          if (user.items.fish) user.items.fish += fishGained
          else user.items.fish = fishGained
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
          user.save()
          embed.addField(':diamond_shape_with_a_dot_inside: Progress', `:trident: **EXP** needed until next level up: **${Math.floor(user.skills.fishing.req - user.skills.fishing.exp)}**`)
          const filter2 = i => i.customID === 'fish' && i.user.id === msg.author.id
          const row2 = new MessageActionRow()
            .addComponents(
              new MessageButton()
                .setLabel('Fish again?')
                .setCustomId('fish')
                .setEmoji('🎣')
                .setStyle('SECONDARY'),   
          )
          message.edit({ embeds: [embed], components: [row2] })
          message.awaitMessageComponentInteraction({ filter2, time: 15000 })
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
        const embed = new MessageEmbed()
          .addField(':fishing_pole_and_fish: Fishing', 'You ran out of time, you will not receive any fishing loot / EXP!')
          .setColor(color)
        return msg.reply({ embeds: [embed] })
      })
    return true
  }
}

module.exports = FishCommand