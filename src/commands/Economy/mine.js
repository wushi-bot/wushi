import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js'
import utils from '../../utils/utils'
import db from 'quick.db'

const eco = new db.table('economy')

class MineCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'mine',
      description: 'Get minerals and rocks by mining ores.',
      category: 'Economy',
      aliases: [],
      usage: 'mine',
      cooldown: 3.5
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
    let goldenStrikingChance = 0
    if (eco.get(`${msg.author.id}.items`).includes('flimsy_pickaxe')) {
      goldenStrikingChance = 15
    } 
    if (eco.get(`${msg.author.id}.items`).includes('decent_pickaxe')) {
      goldenStrikingChance = 25.5
    } 
    if (eco.get(`${msg.author.id}.items`).includes('great_pickaxe')) {
      goldenStrikingChance = 65
    }
    const odds = utils.getRandomInt(0, 100)
    let goldenStriking = false
    if (odds < goldenReelingChance) {
      goldenStriking = true
    } else {
      goldenStriking = false
    }
    let bonus
    if (eco.get(`${msg.author.id}.items`).includes('flimsy_pickaxe')) {
      bonus = utils.getRandomInt(5, 11)
    } 
    if (eco.get(`${msg.author.id}.items`).includes('decent_pickaxe')) {
      bonus = utils.getRandomInt(15, 30)
    } 
    if (eco.get(`${msg.author.id}.items`).includes('great_pickaxe')) {
      bonus = utils.getRandomInt(45, 65)
    }

  }
}

module.exports = MineCommand