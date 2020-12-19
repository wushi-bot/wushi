import { MessageEmbed } from 'discord.js'
import Command from '../../models/Command'
import utils from '../../utils/utils'
import db from 'quick.db'

import tools from '../../resources/items/tools.json'
import upgrades from '../../resources/items/upgrades.json'
import collectables from '../../resources/items/collectables.json'

const eco = new db.table('economy')
const validBoxes = ['common_lootbox']
const commonDrops = ['padlock', 'provato', 'gummi', 'fishing_bait', 'refined_pickaxe']

const allItems = []
for (const item in tools) {
  allItems.push(tools[item])
}
for (const item in upgrades) {
  allItems.push(upgrades[item])
}
for (const item in collectables) {
  allItems.push(collectables[item])
}

class UnboxCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'unbox',
      description: 'Unbox a lootbox.',
      category: 'Economy',
      aliases: ['open', 'ub'],
      usage: 'unbox [item name]',
      cooldown: 1,
      enabled: false
    })
  }

  async run (bot, msg, args) {
    if (!args[0]) return msg.channel.send('You need to specify a lootbox type to open.')
    const specified = args[0].toLowerCase()
    if (!validBoxes.includes(specified)) return msg.channel.send('That lootbox type does not exist.')
    if (!eco.get(`${msg.author.id}.items`).includes(specified)) return msg.channel.send('You don\'t have that lootbox type.')
    if (specified === 'common_lootbox') {
      const num = utils.getRandomInt(1, 4)
      const drops = []
      for (let i = 0; i < num; i++) {
        const randomElement = commonDrops[Math.floor(Math.random() * commonDrops.length)]
        drops.push(randomElement)
      }
      const dropsList = []
      drops.forEach(drop => {
        eco.push(`${msg.author.id}.items`, drop)
      })
      const l1 = utils.removeA(eco.get(`${msg.author.id}.items`), 'common_lootbox')
      eco.set(`${msg.author.id}.items`, l1)
      const embed = new MessageEmbed()
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setColor('#0099ff')
        .setDescription(':package: You\'ve started **opening** your :package: **Common Lootbox**...')
      msg.channel.send(embed).then(m => {
        drops.forEach(drop => {
          const i = utils.getItem(allItems, drop.toLowerCase())
          dropsList.push(`${i.emoji} ${i.display}`)
        })
        embed
          .setDescription(`You got: **${dropsList.join(', ')}**, from your :package: **Common Lootbox**.`)
          .setTimestamp()
        setTimeout(() => {
          m.edit(embed)
        }, 1500)
      })
    }
  }
}

module.exports = UnboxCommand
