
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
  if (place === 'caverns') {
    if (odds > 40) list.push('rock')
    odds = getRandomInt(1, 100)
    if (odds > 60) list.push('iron_nugget')
    odds = getRandomInt(1, 100)
    if (odds > 85) list.push('bug')
  } else if (place === 'mountains') {
    if (odds > 20) list.push('metal')
    odds = getRandomInt(1, 100)
    if (odds > 10) list.push('hunk_of_ice')
    odds = getRandomInt(1, 100)
    if (odds > 60) list.push('snow')  
  } else if (place === 'river') {
    if (odds > 20) list.push('gold_nugget')
    odds = getRandomInt(1, 100)
    if (odds > 10) list.push('trap')
    odds = getRandomInt(1, 100)
    if (odds > 60) list.push('weeds')
  }
  return list
}

class MineCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'mine',
      description: 'Mine to get stuff!',
      category: 'Economy',
      aliases: ['pickaxe'],
      usage: 'mine',
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
      !items['flimsy_pickaxe'] && 
      !items['decent_pickaxe'] && 
      !items['great_pickaxe']
    ) {
      this.client.emit('customError', `You need a pickaxe to mine, purchase one on the store using \`${getPrefix(msg.guild.id)}buy flimsy_pickaxe\`.`, msg)
      return false
    }
    const filter = i => {
      if (i.user.id !== msg.author.id) return false
      if (i.customID === 'river' || i.customID === 'mountains' || i.customID === 'caverns') return true
    }
    let correctChoice = getRandomInt(1, 4)
    let correctDisplay 
    if (correctChoice === 1) {
      correctChoice = 'river'
      correctDisplay = '🌊 River'
    } else if (correctChoice === 2) {
      correctChoice = 'mountains'
      correctDisplay = '🏔️ Mountains'
    } else if (correctChoice === 3) {
      correctChoice = 'caverns'
      correctDisplay = '🪨 Caverns'

    }
    const exp = eco.get(`${msg.author.id}.skills.mining.exp`)
    let bar
    let barItem
    if (eco.get(`${msg.author.id}.skills.mining.exp`) !== 0) {
      bar = Math.ceil(exp / 10)
      barItem = '▇'
    } else {
      bar = 1
      barItem = '**🗙**'
    }
    const chooserEmbed = new MessageEmbed()
      .setColor(color)
      .setFooter('You have 8 seconds to pick a location.')
      .setTitle(':pick: Mining')
      .setDescription(`**:map: Correct Location**\n The **${correctDisplay}** is the correct place to mine at. \n\n:question: **How to mine**\nPlease choose a location to mine at from the corresponding bottom locations.\n\n**:diamond_shape_with_a_dot_inside: Progress**\n:pick: Mining [ ${barItem.repeat(bar)} ] (Level **${romanizeNumber(eco.get(`${msg.author.id}.skills.mining.level`))}**) (**${Math.floor(eco.get(`${msg.author.id}.skills.mining.exp`) / eco.get(`${msg.author.id}.skills.mining.req`) * 100)}**%)`)
      const row = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setLabel('River')
            .setCustomID('river')
            .setEmoji('🌊')
            .setStyle('SECONDARY'),
          new MessageButton()
            .setLabel('Mountains')
            .setCustomID('mountains')
            .setEmoji('🏔️')
            .setStyle('SECONDARY'),   
          new MessageButton()
            .setLabel('Caverns')
            .setCustomID('caverns')
            .setEmoji('🪨')
            .setStyle('SECONDARY'),  
    )
    const message = await msg.reply({ embeds: [chooserEmbed], components: [row] })
    await message.awaitMessageComponentInteraction(filter, { max: 1, time: 8000, errors: ['time'] })
      .then(async interaction => {
        let bonus = 0
        let goldenReelingChance = 0
        if (items['flimsy_pickaxe']) {
          goldenReelingChance = 7.5
          bonus = bonus + 0
        } 
        if (items['decent_pickaxe']) {
          goldenReelingChance = 25.5
          bonus = bonus + getRandomInt(7, 15)
        } 
        if (items['great_pickaxe']) {
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

        if (choice === 'river') choice = '🌊 River'
        else if (choice === 'mountains') choice = '🏔️ Mountains'
        else if (choice === 'caverns') choice = '🪨 Caverns'
        if (correctDisplay !== choice) {
          const embed = new MessageEmbed()
            .addField(':pick: Mining', 'Incorrect choice! You will not get any **mining loot / EXP**!')
            .setColor(color)
          return msg.reply({ embeds: [embed] })
        }
        const followUpEmbed = new MessageEmbed()
          .setColor(color) 
          .addField(':pick: Mining', `Mining at the **${choice}**... please wait...`)
        await interaction.update({ embeds: [followUpEmbed], components: [] })
        setTimeout(async () => {
          let diviningRodBonus
          let loot = await getLoot(interaction.customID)
          if (items['divining_rod']) {
            if (eco.get(`${msg.author.id}.items.divining_rod`) === 0) eco.delete(`${msg.author.id}.items.divining_rod`) 
            else eco.subtract(`${msg.author.id}.items.divining_rod`, 1)
            bonus = bonus + getRandomInt(3, 10)
            diviningRodBonus = true
          }
          const goldenReelBonus = getRandomInt(45, 175)
          let amount = getRandomInt(2, 8)
          let lvl = eco.get(`${msg.author.id}.skills.mining.level`) || 0
          let gemsMined = Math.floor(amount + amount * (lvl * 0.1))
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
          if (eco.get(`${msg.author.id}.items.gem`)) eco.add(`${msg.author.id}.items.gem`, gemsMined)
          else eco.set(`${msg.author.id}.items.gem`, gemsMined)
          if (!diviningRodBonus) {
            embed.addField(':pick: Mining', `You mined for **${getRandomInt(1, 10)} hours**, here's what you mined up!`)
            lootDisplay.push(`${gemsMined} :gem: **Gem** **(+${bonus})**`)
            embed.addField(':tada: Rewards', `+ ` + lootDisplay.join('\n+ '))
          } else {
            embed.addField(':pick: Mining', `You mined for **${getRandomInt(1, 10)} hours**, here's what you mined up!`)
            lootDisplay.push(`${gemsMined} :gem: **Gem** ***(+${bonus})***`)
            embed.addField(':tada: Rewards', `+ ` + lootDisplay.join('\n+ '))
          }
          if (goldenReeling) {
            addMoney(msg.author.id, goldenReelBonus)
            embed.addField(':sparkles: Lucky!', `You also struck gold! You get :coin: **${goldenReelBonus}** as a bonus.`)
          }
          addExp(msg.author, 'mining', msg)
          embed.addField(':diamond_shape_with_a_dot_inside: Progress', `:trident: **EXP** needed until next level up: **${Math.floor(eco.get(`${msg.author.id}.skills.mining.req`) - eco.get(`${msg.author.id}.skills.mining.exp`))}**`)
          const filter2 = i => i.customID === 'mine' && i.user.id === msg.author.id
          const row2 = new MessageActionRow()
            .addComponents(
              new MessageButton()
                .setLabel('Mine again?')
                .setCustomID('mine')
                .setEmoji('⛏️')
                .setStyle('SECONDARY'),   
          )
          message.edit({ embeds: [embed], components: [row2] })
          message.awaitMessageComponentInteraction(filter2, { time: 15000 })
          .then(async i => {
            const cmd = this.client.commands.get('mine')
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

module.exports = MineCommand