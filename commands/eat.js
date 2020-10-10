import discord from 'discord.js'
import db from 'quick.db'
import Command from '../models/Command'
import utils from '../utils/utils'
const eco = new db.table('economy')

class Eat extends Command {
  constructor (client) {
    super(client, {
      name: 'eat',
      description: 'Eat food in your inventory!',
      aliases: ['comer', 'consume', 'use'],
      category: 'Economy',
      usage: 'eat [food]',
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    if (args[0].toString().toLowerCase() === 'provato') {
      if (eco.get(`${msg.author.id}.effects`).includes('doubling')) {
        const embed = new discord.MessageEmbed()
          .setTitle(':busts_in_silhouette: You already have Doubling.')
          .setColor('#77e86b')
        return msg.channel.send(embed)
      }
      if (!eco.get(`${msg.author.id}.items`).includes('Provato')) {
        const embed = new discord.MessageEmbed()
          .setTitle(':busts_in_silhouette: You don\'t have a Provato Cherry.')
          .setDescription('You need to buy one on the store using `.buy provato`.')
          .setColor('#77e86b')
        return msg.channel.send(embed)
      } else {
        eco.push(`${msg.author.id}.effects`, 'doubling')
        const i = utils.removeA(eco.get(`${msg.author.id}.items`), 'Provato')
        eco.set(`${msg.author.id}.items`, i)
        const embed = new discord.MessageEmbed()
          .setTitle(':busts_in_silhouette: You now have the Doubling effect.')
          .setDescription('You will now get 2x money output for 30s!')
          .setFooter(`Eaten by ${msg.author.username}`, msg.author.avatarURL())
          .setTimestamp(Date.now())
          .setColor('#77e86b')
        msg.channel.send(embed)
        setTimeout(function () {
          var effects = utils.removeA(eco.get(`${msg.author.id}.effects`), 'doubling')
          eco.set(`${msg.author.id}.effects`, effects)
          const embed = new discord.MessageEmbed()
            .setTitle(':busts_in_silhouette: You no longer have the Doubling effect.')
            .setDescription('You can eat another Provato to regain the effect!')
            .setFooter(`Eaten by ${msg.author.username}`, msg.author.avatarURL())
            .setTimestamp(Date.now())
            .setColor('#77e86b')
          return msg.channel.send(embed)
        }, 45000)
      }
    }
    if (args[0].toString().toLowerCase() === 'uber') {
      if (eco.get(`${msg.author.id}.effects`).includes('uber')) {
        const embed = new discord.MessageEmbed()
          .setTitle(':apple: You\'re already under the effects of Über.')
          .setDescription('Store up Über using `.uber <amount>`, and burst using `.uber burst`.')
          .setColor('#77e86b')
        return msg.channel.send(embed)
      }
      if (!eco.get(`${msg.author.id}.items`).includes('UberFruit')) {
        const embed = new discord.MessageEmbed()
          .setTitle(':apple: You don\'t have a ÜberFruit.')
          .setDescription('You need to buy one on the store using `.buy uber`.')
          .setColor('#77e86b')
        return msg.channel.send(embed)
      } else {
        eco.push(`${msg.author.id}.effects`, 'uber')
        const i = utils.removeA(eco.get(`${msg.author.id}.items`), 'UberFruit')
        eco.set(`${msg.author.id}.items`, i)
        const embed = new discord.MessageEmbed()
          .setTitle(':apple: You now have the Über effect.')
          .setDescription('You can store Über using `.uber <amount>` and burst using `.uber burst`.')
          .setFooter(`Eaten by ${msg.author.username}`, msg.author.avatarURL())
          .setTimestamp(Date.now())
          .setColor('#77e86b')
        msg.channel.send(embed)
      }
    }
    if (args[0].toString().toLowerCase() === 'gummi') {
      if (eco.get(`${msg.author.id}.effects`).includes('hardening')) {
        const embed = new discord.MessageEmbed()
          .setTitle(':lock: You already have Hardening.')
          .setColor('#77e86b')
        return msg.channel.send(embed)
      }
      if (!eco.get(`${msg.author.id}.items`).includes('Gummi')) {
        const embed = new discord.MessageEmbed()
          .setTitle(':lock: You don\'t have a Kodo Gummi.')
          .setDescription('You need to buy one on the store using `.buy gummi`.')
          .setColor('#77e86b')
        return msg.channel.send(embed)
      } else {
        eco.push(`${msg.author.id}.effects`, 'hardening')
        const i = utils.removeA(eco.get(`${msg.author.id}.items`), 'gummi')
        eco.set(`${msg.author.id}.items`, i)
        const embed = new discord.MessageEmbed()
          .setTitle(':lock: You now have the Hardening effect.')
          .setDescription('You will no longer gain tool durability loss.')
          .setFooter(`Eaten by ${msg.author.username}`, msg.author.avatarURL())
          .setTimestamp(Date.now())
          .setColor('#77e86b')
        msg.channel.send(embed)
        setTimeout(function () {
          var effects = utils.removeA(eco.get(`${msg.author.id}.effects`), 'hardening')
          eco.set(`${msg.author.id}.effects`, effects)
          const embed = new discord.MessageEmbed()
            .setTitle(':lock: You no longer have the Hardening effect.')
            .setDescription('You can eat another Kodo Gummi to regain the effect!')
            .setFooter(`Eaten by ${msg.author.username}`, msg.author.avatarURL())
            .setTimestamp(Date.now())
            .setColor('#77e86b')
          return msg.channel.send(embed)
        }, 120000)
      }
    }
  }
}

module.exports = Eat
