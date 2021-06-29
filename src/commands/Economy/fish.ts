
import Command from '../../classes/Command'
import { MessageEmbed, MessageActionRow, MessageButton } from 'discord.js'
import { getRandomInt, getPrefix, addCommas } from '../../utils/utils'
import { addMoney, addExp } from '../../utils/economy'
import db from 'quick.db'

const eco = new db.table('economy')
const cfg = new db.table('config')

async function getLoot(place: string) {
  const odds = getRandomInt(1, 100)
  if (place === 'ice_pond') {
    
  } else if (place === 'lake') {
    
  } else if (place === 'ocean') {

  }
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
    const chooserEmbed = new MessageEmbed()
      .setColor(color)
      .setFooter('You have 8 seconds to pick a location.')
      .addField(':fishing_pole_and_fish: Fishing', 'Please choose a location to fish at from the corresponding bottom locations.')
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
        const followUpEmbed = new MessageEmbed()
          .setColor(color) 
          .addField(':fishing_pole_and_fish: Fishing', `Fishing at the **${choice}**... please wait...`)
        await interaction.update({ embeds: [followUpEmbed], components: [] })
        setTimeout(() => {
          let fishingBaitBonus
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
          if (!fishingBaitBonus) {
            embed.addField(':fishing_pole_and_fish: Fishing', `You fished for **${getRandomInt(1, 10)} hours**, here's what you fished up!`)
            embed.addField(':tada: Rewards', `+ :fish: ${fishGained} **(+${bonus})**`)
          } else {
            embed.addField(':fishing_pole_and_fish: Fishing', `You fished for **${getRandomInt(1, 10)} hours**, here's what you fished up!`)
            embed.addField(':tada: Rewards', `+ :fish: ${fishGained} ***(+${bonus})***`)
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