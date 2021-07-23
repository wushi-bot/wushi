import Command from '../../classes/Command'
import { MessageEmbed } from 'discord.js'

import { getPet, getPrefix, addCommas, getRandomInt, getColor } from '../../utils/utils'
import { addMoney } from '../../utils/economy'
import User from '../../models/User'

import petsList from '../../resources/items/pets.json'
import { isPrefixUnaryExpression } from 'typescript'

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
    const color = await getColor(bot, msg.member)
    const prefix = await getPrefix(msg.guild.id)
    const user = await User.findOne({
      id: msg.author.id
    }).exec()
    if (!user || !user.started) {
      this.client.emit('customError', `You don't have a bank account! Create one using \`${prefix}start\`.`, msg)
      return false
    }
    if (!args[0]) {
      const embed = new MessageEmbed()
        .setColor(color)
        .setTitle(':bone: Pets - Main Menu')
      if (!user.pets.active) {
        embed.addField(':knot: Active pet', 'You don\'t have a pet active.')
        embed.addField(':question: Want to buy a pet?', `Use \`${prefix}pets shop\` to see pets to buy!`)
      } else {
        const pet = user.pets.list.filter(value => value.id === user.pets.active)[0]
        const food = user.pets.food || 0
        if (!user.pets.energy) user.pets.energy = 10
        const energy = user.pets.energy || 0
        const happiness = pet.happiness || 0
        const display = getPet(petsList, pet.pet)
        const health = Math.floor(((pet.happiness + pet.hunger) / 200) * 100)
        const income = user.pets.income || 0
        const exp = pet.exp
        let emoji = ':smile:'
        if (happiness < 20) emoji = ':rage:'
        else if (happiness < 40) emoji = ':angry:'
        else if (happiness < 60) emoji = ':neutral_face:'
        else if (happiness < 80) emoji = ':slight_smile:'
        else if (happiness < 90) emoji = ':smile:'
        else if (happiness === 100) emoji = ':smiley:'
        embed.addField(`${display.emoji} **${display.display}** (Level ${pet.level})`, `EXP: :sparkles: **${exp}/100**\nHealth: :heart: **${health}%**\nHappiness: ${emoji} **${pet.happiness}%**\nHunger: :meat_on_bone: **${pet.hunger}%**\nIncome: :coin: **${pet.income}**`)
        embed.addField(':bust_in_silhouette: You', `Food: :meat_on_bone: **${addCommas(food)}**\nEnergy: :cloud_lightning: **${energy}/10**`)
        if (income !== 0) embed.addField(`:money_with_wings: Income`, `You have earned :coin: **${addCommas(user.pets.income)}** from your pet, collect it using \`${prefix}pet collect\`.`)
      if (health < 50) {
        embed.addField(':broken_heart: Health Alert!', `Your pet is doing poor in health! Please feed your pet (\`${prefix}pet feed\`) and play (\`${prefix}pet play\`) with it!`)
      }
      }
      await msg.reply({ embeds: [embed] })
      return true
    } else if (args[0] === 'shop') {
      const embed = new MessageEmbed()
        .setColor(color)
        .setTitle(':bone: Pets - Shop Catalog')
      petsList.forEach(pet => {
        embed.addField(`${pet.emoji} **${pet.display}**`, `ID: \`${pet.id}\` | Price: :coin: **${addCommas(pet.price)}** | Income: :coin: **${addCommas(pet.income)}** | Description: **${pet.description}**`)
      })
      await msg.reply({ embeds: [embed] })
      return true
    } else if (args[0] === 'buy') {
      const item = getPet(petsList, args[1])
      if (!item) {
        this.client.emit('customError', 'The item you\'ve inserted is not a valid item, please try again or try to retype it.', msg)
        return false
      }
      if (!user.started) {
        this.client.emit('customError', `You have no account setup! Set one up using \`${prefix}start\`.`, msg)
        return false
      }
      if (user.balance < item.price) {
        this.client.emit('customError', `${item.emoji} Insufficient coins! | You are :coin: **${addCommas(item.price - user.balance)}** off.`, msg)
        return false
      }
      user.balance -= item.price
      user.pets.count += 1
      user.pets.list.push({ pet: item.id, id: user.pets.count, level: 0, exp: 0, happiness: 100, ailments: [], hunger: 100, income: item.income })
      const embed = new MessageEmbed()
        .addField(`${item.emoji} Successfully purchased your very own **${item.display}**!`, `Balance: :coin: **${addCommas(Math.floor(user.balance))}** | Set the pet as your active pet using \`${prefix}pets set ${user.pets.count}\`. | ${item.description.replace('[PRE]', prefix)}`)
        .setColor(color)
      msg.reply({ embeds: [embed] })
      return true
    } else if (args[0] === 'set') {
      if (!args[1]) {
        this.client.emit('customError', 'You didn\'t input an ID as your pet.', msg) 
        return false
      }
      const result = user.pets.list.filter(pet => pet.id === args[1])[0]
      if (!result) {
        this.client.emit('customError', 'Invalid pet ID', msg)
        return false
      }
      user.pets.active = result.id
      const pet = getPet(petsList, result.pet)
      const embed = new MessageEmbed()
        .setColor(color)
        .addField('<:check:820704989282172960> Success!', `Successfully set your active pet as ${pet.emoji} **${pet.display}**.`)
      msg.reply({ embeds: [embed] })
      return true
    } else if (args[0] === 'redeem') {
      const items = user.items || {}
      if (!items['food_bundle'] && !items['energy_drink']) {
        this.client.emit('customError', 'You do not have any food bundles or energy drink.', msg)
        return false
      }
      if (items['food_bundle'] && !items['energy_drink']) {
        if (user.items.food_bundle === 1) delete user.items.food_bundle 
        else user.items.food_bundle
        user.pets.food += 10
        const embed = new MessageEmbed()
          .setColor(color)
          .addField('<:check:820704989282172960> Success!', 'Successfully redeemed :meat_on_bone: **10** from your food bundle.')
        msg.reply({ embeds: [embed] })
      }
      if (!items['food_bundle'] && items['energy_drink']) {
        if (user.items.energy_drink === 1) delete user.items.energy_drink 
        else user.items.energy_drink -= 1
        user.pets.energy = 10
        const embed = new MessageEmbed()
          .setColor(color)
          .addField('<:check:820704989282172960> Success!', 'Successfully replenished :cloud_lightning: **10** from drinking energy drink.')
        msg.reply({ embeds: [embed] })
      } 
      if (items['food_bundle'] && items['energy_drink']) {
        if (user.items.energy_drink === 1) delete user.items.energy_drink 
        else user.items.energy_drink -= 1
        if (user.items.food_bundle === 1) delete user.items.food_bundle
        else user.items.food_bundle -= 1
        user.pets.energy = 10
        user.pets.food = 10
        const embed = new MessageEmbed()
          .setColor(color)
          .addField('<:check:820704989282172960> Success!', 'Successfully replenished :cloud_lightning: **10** & redeemed :meat_on_bone: **10** from drinking energy drink & your food bundle.')
        msg.reply({ embeds: [embed] })
      }
      return false
    } else if (args[0] === 'feed') {
      if (!user.pets.active) {
        this.client.emit('customError', 'You have no pet active!')
        return false
      }
      if (!user.pets.food || user.pets.food === 0) {
        this.client.emit('customError', `You don't have any food! Buy some food on the shop via \`${prefix}shop pets\`.`)
        return false
      }
      const list = user.pets.list || []
      const pet = list.filter(value => value.id === user.pets.active)[0]
      if (pet.hunger === 100) {
        this.client.emit('customError', 'Your pet is already full!', msg) 
        return false 
      }
      user.pets.food
      const index = list.indexOf(pet)
      let addedHunger = 20
      if (pet.hunger + 20 > 100) {
        addedHunger = 100 - (pet.hunger) 
      }  
      pet.hunger = pet.hunger + addedHunger
      const addedExp = getRandomInt(5, 10)
      pet.exp = pet.exp + addedExp
      let levelUp
      let moreMoney
      if (pet.exp > 100) {
        pet.exp = pet.exp - 100
        pet.level = pet.level + 1
        levelUp = true
        moreMoney = getRandomInt(10, 30)
        pet.income = pet.income + moreMoney
      }
      list[index] = pet
      user.pets.list = list
      const embed = new MessageEmbed()
        .addField('<:check:820704989282172960> Success!', `Successfully fed your pet :meat_on_bone: **${addedHunger}**. (**${pet.hunger}/100**)`)
        .setColor(color)
      if (levelUp === true) {
        const display = getPet(petsList, pet.pet)
        embed.addField(`:sparkles: Oh? Your ${display.emoji} ${display.display} leveled up!`, `Your ${display.emoji} **${display.display}** has leveled up to **Level ${pet.level}**, you earn **:coin: ${moreMoney}** more income!`)
      }
      msg.reply({ embeds: [embed] })
      return true
    } else if (args[0] === 'play') {
      if (!user.pets.active) {
        this.client.emit('customError', 'You have no pet active!')
        return false
      }
      if (!user.pets.energy || user.pets.energy  === 0) {
        this.client.emit('customError', `You don't have any energy! You must wait to get energy, or buy energy drink.`)
        return false
      }
      user.pets.energy -= 1
      const list = user.pets.list || []
      const pet = list.filter(value => value.id === user.pets.active)[0]
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
      const addedExp = getRandomInt(5, 10)
      pet.exp = pet.exp + addedExp
      let levelUp
      let moreMoney
      if (pet.exp > 100) {
        pet.exp = pet.exp - 100
        pet.level = pet.level + 1
        levelUp = true
        moreMoney = getRandomInt(10, 30)
        pet.income = pet.income + moreMoney
      }
      list[index] = pet
      user.pets.list = list
      const embed = new MessageEmbed()
        .addField('<:check:820704989282172960> Success!', `Successfully played with your pet :cloud_lightning: **${addedHappiness}**. (**${pet.happiness}/100**)`)
        .setColor(color)
      if (levelUp === true) {
        const display = getPet(petsList, pet.pet)
        embed.addField(`:sparkles: Oh? Your ${display.emoji} ${display.display} leveled up!`, `Your ${display.emoji} **${display.display}** has leveled up to **Level ${pet.level}**, you earn **:coin: ${moreMoney}** more income!`)
      }
      msg.reply({ embeds: [embed] })
      return true
    } else if (args[0] === 'collect') {
      let income = user.pets.income
      income = addMoney(msg.author.id, Math.floor(income))
      user.pets.income = 0
      const embed = new MessageEmbed()
        .addField('<:check:820704989282172960> Success!', `Successfully collected :coin: **${addCommas(Math.floor(income))}** from your pet!`)
        .setColor(color)
      msg.reply({ embeds: [embed] })
      return true
    } else if (args[0] === 'list') {
      const list = user.pets.list || []
      if (list.length === 0) {
        this.client.emit('customError', 'You have no pets, buy some on the store!', msg)
        return false 
      }
      const embed = new MessageEmbed()
        .setColor(color)
        .setTitle(':bone: Pets - List')
      list.forEach(pet => {
        let gottenPet = getPet(petsList, pet.pet) 
        embed.addField(`${gottenPet.emoji} ${gottenPet.display} (Level ${pet.level})`, `ID: \`${pet.id}\` | Income: **:coin: ${addCommas(pet.income)}** | Happiness: **:smile: ${pet.happiness}/100** | Hunger: :meat_on_bone: **${pet.hunger}/100**`)
      })
      msg.reply({ embeds: [embed] }) 
      return true
    } 
    user.save()
  }
}

module.exports = PetsCommand