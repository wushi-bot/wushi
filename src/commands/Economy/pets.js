import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js-light'

import utils from '../../utils/utils'
import ecoUtils from '../../utils/economy'
import db from 'quick.db'

import petsList from '../../resources/items/pets.json'

const eco = new db.table('economy')
const cfg = new db.table('config')
const pets = new db.table('pets')

class PetsCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'pets',
      description: 'Main command for pets',
      category: 'Pets',
      aliases: ['pet'],
      subcommands: ['shop', 'buy', 'set', 'redeem', 'feed', 'play', 'collect', 'list'],
      usage: 'pets [subcommand]',
      cooldown: 1.5
    })
  }

  async run (bot, msg, args) {
    const color = cfg.get(`${msg.author.id}.color`) || msg.member.roles.highest.color
    if (!args[0]) {
      const embed = new MessageEmbed()
        .setColor(color)
        .setTitle(':bone: Pets - Main Menu')
      if (!pets.get(`${msg.author.id}.active`)) {
        embed.addField(':knot: Active pet', 'You don\'t have a pet active.')
        embed.addField(':question: Want to buy a pet?', `Use \`${utils.getPrefix(msg.guild.id)}pets shop\` to see pets to buy!`)
      } else {
        const pet = pets.get(`${msg.author.id}.pets`).filter(value => value.id === pets.get(`${msg.author.id}.active`))[0]
        const food = pets.get(`${msg.author.id}.food`) || 0
        if (!pets.get(`${msg.author.id}.energy`)) pets.set(`${msg.author.id}.energy`, 10)
        const energy = pets.get(`${msg.author.id}.energy`) || 0
        const happiness = pet.happiness || 0
        const display = utils.getPet(petsList, pet.pet)
        const health = Math.floor(((pet.happiness + pet.hunger) / 200) * 100)
        const income = pets.get(`${msg.author.id}.income`) || 0
        const exp = pet.exp
        let emoji = ':smile:'
        if (happiness < 20) emoji = ':rage:'
        else if (happiness < 40) emoji = ':angry:'
        else if (happiness < 60) emoji = ':neutral_face:'
        else if (happiness < 80) emoji = ':slight_smile:'
        else if (happiness < 90) emoji = ':smile:'
        else if (happiness === 100) emoji = ':smiley:'
        embed.addField(`${display.emoji} **${display.display}** (Level ${pet.level})`, `EXP: :sparkles: **${exp}/100**\nHealth: :heart: **${health}%**\nHappiness: ${emoji} **${pet.happiness}%**\nHunger: :meat_on_bone: **${pet.hunger}%**\nIncome: :coin: **${pet.income}**`)
        embed.addField(':bust_in_silhouette: You', `Food: :meat_on_bone: **${utils.addCommas(food)}**\nEnergy: :cloud_lightning: **${energy}/10**`)
        if (income !== 0) embed.addField(`:money_with_wings: Income`, `You have earned :coin: **${utils.addCommas(pets.get(`${msg.author.id}.income`))}** from your pet, collect it using \`${utils.getPrefix(msg.guild.id)}pet collect\`.`)
      if (health < 50) {
        embed.addField(':broken_heart: Health Alert!', `Your pet is doing poor in health! Please feed your pet (\`${utils.getPrefix(msg.guild.id)}pet feed\`) and play (\`${utils.getPrefix(msg.guild.id)}pet play\`) with it!`)
      }
      }
      await msg.reply(embed)
      return true
    } else if (args[0] === 'shop') {
      const embed = new MessageEmbed()
        .setColor(color)
        .setTitle(':bone: Pets - Shop Catalog')
      petsList.forEach(pet => {
        embed.addField(`${pet.emoji} **${pet.display}**`, `ID: \`${pet.id}\` | Price: :coin: **${utils.addCommas(pet.price)}** | Income: :coin: **${utils.addCommas(pet.income)}** | Description: **${pet.description}**`)
      })
      await msg.reply(embed)
      return true
    } else if (args[0] === 'buy') {
      const item = utils.getPet(petsList, args[1])
      if (!item) {
        this.client.emit('customError', 'The item you\'ve inserted is not a valid item, please try again or try to retype it.', msg)
        return false
      }
      if (!eco.get(`${msg.author.id}.started`)) {
        this.client.emit('customError', `You have no account setup! Set one up using \`${utils.getPrefix(msg.guild.id)}start\`.`, msg)
        return false
      }
      if (eco.get(`${msg.author.id}.balance`) < item.price) {
        this.client.emit('customError', `${item.emoji} Insufficient coins! | You are :coin: **${utils.addCommas(item.price - eco.get(`${msg.author.id}.balance`))}** off.`, msg)
        return false
      }
      eco.subtract(`${msg.author.id}.balance`, item.price)
      pets.add(`${msg.author.id}.count`, 1)
      pets.push(`${msg.author.id}.pets`, { pet: item.id, id: `${pets.get(`${msg.author.id}.count`)}`, level: 0, exp: 0, happiness: 100, ailments: [], hunger: 100, income: item.income })
      const embed = new MessageEmbed()
        .addField(`${item.emoji} Successfully purchased your very own **${item.display}**!`, `Balance: :coin: **${utils.addCommas(Math.floor(eco.get(`${msg.author.id}.balance`)))}** | Set the pet as your active pet using \`${utils.getPrefix(msg.guild.id)}pets set ${pets.get(`${msg.author.id}.count`)}\`. | ${item.description.replace('[PRE]', utils.getPrefix(msg.guild.id))}`)
        .setColor(color)
      msg.reply(embed)
      return true
    } else if (args[0] === 'set') {
      if (!args[1]) {
        this.client.emit('customError', 'You didn\'t input an ID as your pet.', msg) 
        return false
      }
      const result = pets.get(`${msg.author.id}.pets`).filter(pet => pet.id === args[1])[0]
      if (!result) {
        this.client.emit('customError', 'Invalid pet ID', msg)
        return false
      }
      pets.set(`${msg.author.id}.active`, result.id)
      const pet = utils.getPet(petsList, result.pet)
      const embed = new MessageEmbed()
        .setColor(color)
        .addField('<:check:820704989282172960> Success!', `Successfully set your active pet as ${pet.emoji} **${pet.display}**.`)
      msg.reply(embed)
      return true
    } else if (args[0] === 'redeem') {
      const items = eco.get(`${msg.author.id}.items`) || {}
      if (!items['food_bundle'] && !items['energy_drink']) {
        this.client.emit('customError', 'You do not have any food bundles or energy drink.', msg)
        return false
      }
      if (items['food_bundle'] && !items['energy_drink']) {
        if (eco.get(`${msg.author.id}.items.food_bundle`) === 0) eco.delete(`${msg.author.id}.items.food_bundle`) 
        else eco.subtract(`${msg.author.id}.items.food_bundle`, 1)
        pets.add(`${msg.author.id}.food`, 10)
        const embed = new MessageEmbed()
          .setColor(color)
          .addField('<:check:820704989282172960> Success!', 'Successfully redeemed :meat_on_bone: **10** from your food bundle.')
        msg.reply(embed)
      }
      if (!items['food_bundle'] && items['energy_drink']) {
        if (eco.get(`${msg.author.id}.items.energy_drink`) === 0) eco.delete(`${msg.author.id}.items.energy_drink`) 
        else eco.subtract(`${msg.author.id}.items.energy_drink`, 1)
        pets.set(`${msg.author.id}.energy`, 10)
        const embed = new MessageEmbed()
          .setColor(color)
          .addField('<:check:820704989282172960> Success!', 'Successfully replenished :cloud_lightning: **10** from drinking energy drink.')
        msg.reply(embed)
      } 
      if (items['food_bundle'] && items['energy_drink']) {
        if (eco.get(`${msg.author.id}.items.energy_drink`) === 0) eco.delete(`${msg.author.id}.items.energy_drink`) 
        else eco.subtract(`${msg.author.id}.items.energy_drink`, 1)
        if (eco.get(`${msg.author.id}.items.food_bundle`) === 0) eco.delete(`${msg.author.id}.items.food_bundle`) 
        else eco.subtract(`${msg.author.id}.items.food_bundle`, 1)
        pets.set(`${msg.author.id}.energy`, 10)
        pets.add(`${msg.author.id}.food`, 10)
        const embed = new MessageEmbed()
          .setColor(color)
          .addField('<:check:820704989282172960> Success!', 'Successfully replenished :cloud_lightning: **10** & redeemed :meat_on_bone: **10** from drinking energy drink & your food bundle.')
        msg.reply(embed)
      }
      return false
    } else if (args[0] === 'feed') {
      if (!pets.get(`${msg.author.id}.active`)) {
        this.client.emit('customError', 'You have no pet active!')
        return false
      }
      if (!pets.get(`${msg.author.id}.food`) || pets.get(`${msg.author.id}.food`) === 0) {
        this.client.emit('customError', `You don't have any food! Buy some food on the shop via \`${utils.getPrefix(msg.guild.id)}shop pets\`.`)
        return false
      }
      const list = pets.get(`${msg.author.id}.pets`) || []
      const pet = list.filter(value => value.id === pets.get(`${msg.author.id}.active`))[0]
      if (pet.hunger === 100) {
        this.client.emit('customError', 'Your pet is already full!', msg) 
        return false 
      }
      pets.subtract(`${msg.author.id}.food`, 1)
      const index = list.indexOf(pet)
      let addedHunger = 20
      if (pet.hunger + 20 > 100) {
        addedHunger = 100 - (pet.hunger) 
      }  
      pet.hunger = pet.hunger + addedHunger
      const addedExp = utils.getRandomInt(5, 10)
      pet.exp = pet.exp + addedExp
      let levelUp
      if (pet.exp > 100) {
        pet.exp = pet.exp - 100
        pet.level = pet.level + 1
        levelUp = true
        const moreMoney = utils.getRandomInt(10, 30)
        pet.income = pet.income + moreMoney
      }
      list[index] = pet
      pets.set(`${msg.author.id}.pets`, list)
      const embed = new MessageEmbed()
        .addField('<:check:820704989282172960> Success!', `Successfully fed your pet :meat_on_bone: **${addedHunger}**. (**${pet.hunger}/100**)`)
        .setColor(color)
      if (levelUp === true) {
        const display = utils.getPet(petsList, pet.pet)
        embed.addField(`:sparkles: Oh? Your ${display.emoji} ${display.display} leveled up!`, `Your ${display.emoji} **${display.display}** has leveled up to **Level ${pet.level}**, you earn **:coin: ${moreMoney}** more income!`)
      }
      msg.reply(embed)
      return true
    } else if (args[0] === 'play') {
      if (!pets.get(`${msg.author.id}.active`)) {
        this.client.emit('customError', 'You have no pet active!')
        return false
      }
      if (!pets.get(`${msg.author.id}.energy`) || pets.get(`${msg.author.id}.energy`) === 0) {
        this.client.emit('customError', `You don't have any energy! You must wait to get energy, or buy energy drink.`)
        return false
      }
      pets.subtract(`${msg.author.id}.energy`, 1)
      const list = pets.get(`${msg.author.id}.pets`) || []
      const pet = list.filter(value => value.id === pets.get(`${msg.author.id}.active`))[0]
      if (pet.happiness === 100) {
        this.client.emit('customError', 'Your pet is already too happy!', msg) 
        return false 
      }
      const index = list.indexOf(pet)
      let addedHappiness = 20
      if (pet.happiness + 20 > 100) {
        addedHappiness = 100 - (pet.happiness) 
      }  
      pet.happiness = pet.happiness + addedHappiness
      const addedExp = utils.getRandomInt(5, 10)
      pet.exp = pet.exp + addedExp
      let levelUp
      if (pet.exp > 100) {
        pet.exp = pet.exp - 100
        pet.level = pet.level + 1
        levelUp = true
        const moreMoney = utils.getRandomInt(10, 30)
        pet.income = pet.income + moreMoney
      }
      list[index] = pet
      pets.set(`${msg.author.id}.pets`, list)
      const embed = new MessageEmbed()
        .addField('<:check:820704989282172960> Success!', `Successfully played with your pet :cloud_lightning: **${addedHappiness}**. (**${pet.happiness}/100**)`)
        .setColor(color)
      if (levelUp === true) {
        const display = utils.getPet(petsList, pet.pet)
        embed.addField(`:sparkles: Oh? Your ${display.emoji} ${display.display} leveled up!`, `Your ${display.emoji} **${display.display}** has leveled up to **Level ${pet.level}**, you earn **:coin: ${moreMoney}** more income!`)
      }
      msg.reply(embed)
      return true
    } else if (args[0] === 'collect') {
      let income = pets.get(`${msg.author.id}.income`)
      income = ecoUtils.addMoney(msg.author.id, Math.floor(income))
      pets.set(`${msg.author.id}.income`, 0)
      const embed = new MessageEmbed()
        .addField('<:check:820704989282172960> Success!', `Successfully collected :coin: **${utils.addCommas(Math.floor(income))}** from your pet!`)
        .setColor(color)
      msg.reply(embed)
      return true
    } else if (args[0] === 'list') {
      const list = pets.get(`${msg.author.id}.pets`) || []
      if (list.length === 0) {
        this.client.emit('customError', 'You have no pets, buy some on the store!', msg)
        return false 
      }
      const embed = new MessageEmbed()
        .setColor(color)
        .setTitle(':bone: Pets - List')
      list.forEach(pet => {
        let gottenPet = utils.getPet(petsList, pet.pet) 
        embed.addField(`${gottenPet.emoji} ${gottenPet.display} (Level ${pet.level})`, `ID: \`${pet.id}\` | Income: **:coin: ${utils.addCommas(pet.income)}** | Happiness: **:smile: ${pet.happiness}/100** | Hunger: :meat_on_bone: **${pet.hunger}/100**`)
      })
      msg.reply(embed) 
      return true
    } 
  }
}

module.exports = PetsCommand