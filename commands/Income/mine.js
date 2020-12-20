import discord from 'discord.js'
import db from 'quick.db'
import utils from '../../utils/utils'
import Command from '../../models/Command'
const eco = new db.table('economy')

var lootTables = ['iron', 'silver', 'cobalt', 'lithium', 'bauxite', 'gold']

function generateRandomDrop () {
  var lootTable = lootTables[Math.floor(Math.random() * lootTables.length)]
  let display
  let loot
  switch (lootTable) {
    case 'iron':
      display = 'Iron'
      loot = 75
      break
    case 'silver':
      display = 'Silver'
      loot = 85
      break
    case 'cobalt':
      display = 'Cobalt'
      loot = 100
      break
    case 'lithium':
      display = 'Lithium'
      loot = 99
      break
    case 'bauxite':
      display = 'Bauxite'
      loot = 120
      break
    case 'gold':
      display = 'Gold'
      loot = 150
      break
    default:
      return
  }
  return [display, loot]
}

class MineCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'mine',
      description: 'Mine ores for cash.',
      category: 'Income',
      aliases: ['dig'],
      usage: 'mine',
      cooldown: 120
    })
  }

  async run (bot, msg, args) {
    if (!eco.get(`${msg.author.id}.started`)) {
      const embed = new discord.MessageEmbed()
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setColor('#f20f0f')
        .setDescription(':x: You have no account setup! Set one up using `.start`.')
      return msg.channel.send(embed)
    }
    if (!eco.get(`${msg.author.id}.items`).includes('pickaxe')) {
      const embed = new discord.MessageEmbed()
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setColor('#f20f0f')
        .setDescription(`You need a pickaxe to mine, obviously. | Buy one on the store using \`${utils.getPrefix(msg.guild.id)}buy pickaxe\``)
      msg.channel.send(embed)
      return
    }
    const stuff = generateRandomDrop()
    if (eco.get(`${msg.author.id}.items`).includes('refined_pickaxe')) {
      var multiplies = 0
      eco.get(`${msg.author.id}.items`).forEach(item => {
        if (item === 'refined_pickaxe') {
          if (multiplies < 6) {
            var temp = stuff[1]
            stuff[1] = Math.floor(temp + (temp * 0.25))
          }
          multiplies++
        }
      })
    }
    var earnings = utils.addMoney(stuff[1], msg.author.id)
    eco.add(`${msg.author.id}.mining_profit`, stuff[1])
    if (!eco.get(`${msg.author.id}.pickaxe_durability`)) eco.set(`${msg.author.id}.pickaxe_durability`, 0)
    if (eco.get(`${msg.author.id}.effects`)) {
      if (!eco.get(`${msg.author.id}.effects`).includes('hardening')) {
        eco.add(`${msg.author.id}.pickaxe_durability`, 1)
      }
    } else {
      eco.add(`${msg.author.id}.pickaxe_durability`, 1)
    }
    const embed = new discord.MessageEmbed()
      .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
      .setColor('#0099ff')
      .setDescription(':pick: You\'ve started **mining**...')
    msg.channel.send(embed).then(m => {
      embed
        .setFooter(`Your pickaxe durability is at ${75 - eco.get(`${msg.author.id}.pickaxe_durability`)}/75`)
        .setDescription(`:pick: You've **mined** up some **${stuff[0]}**!\n───────────────────────\n• You've earned :coin: **+${earnings}**!\n• Your new balance is :coin: **${utils.addCommas(eco.get(`${msg.author.id}.balance`))}**.`)
        .setTimestamp()
      setTimeout(() => {
        m.edit(embed)
      }, 1500)
    })
    if (eco.get(`${msg.author.id}.pickaxe_durability`) === 75 || eco.get(`${msg.author.id}.pickaxe_durability`) > 75) {
      let i = utils.removeA(eco.get(`${msg.author.id}.items`), 'pickaxe')
      if (eco.get(`${msg.author.id}.items`).includes('refined_pickaxe')) {
        i = utils.removeA(eco.get(`${msg.author.id}.items`), 'refined_pickaxe')
      }
      eco.set(`${msg.author.id}.items`, i)
      const embed = new discord.MessageEmbed()
        .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL())
        .setTitle(':pick: Uh oh, your **pickaxe** broke!')
        .setColor('#ff2803')
      msg.channel.send(embed)
      eco.set(`${msg.author.id}.pickaxe_durability`, 0)
    }
  }
}

module.exports = MineCommand
