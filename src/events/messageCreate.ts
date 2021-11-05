import { Message, Collection } from "discord.js";
import Guild from '../schemas/Guild'
import { getMember } from '../utils/database'
import { getRandomInt } from '../utils/functions'
import Bot from "../models/Client";

const expCooldowns = new Collection()

exports.run = async (bot: Bot, message: Message) => {
  if (message.author.bot) return
  if (message.webhookId) return
  let guild = await Guild.findOne({
    id: message.guild.id
  }).exec()
  if (guild && guild.leveling) {
    if (!expCooldowns.has(message.author.id)) {
      let member = await getMember(message.author.id, message.guild.id)
      let exp = await getRandomInt(6, 16)
      member.exp += exp
      member.totalExp += exp
      bot.logger.info(`Added ${Math.floor(exp)} exp to ${message.author.username}#${message.author.discriminator} (${message.author.id}) in ${message.guild.id}.`)
      if (member.expNeeded <= member.exp) {
        member.level += 1
        member.exp -= member.expNeeded 
        member.expNeeded = Math.floor(member.expNeeded + (member.expNeeded * 0.1))
        let rewards = guild.rewards
        for (let reward of rewards) {
          if (reward.requirement === member.level) {
            let role = await message.guild.roles.fetch(reward.role) || null
            if (role) {
              try {
                message.member.roles.add(role.id, `For leveling up via wushi, they gained the ${role.name} role leveling up to Level ${member.level}`)
              } catch (e) {
                bot.logger.error(`Couldn't add ${message.author.id}'s reward for leveling up to Level ${member.level}, I probably lack the permission to. (${e})`)
              }
            }

          }
        }
        if (!guild.levelUpMessage) { 
          try {
            message.channel.send(`Congratulations, **${message.author.username}**, you've leveled :up: to **Level ${member.level}**!`)
          } catch (e) {}
          
        } else {
          let lvlMsg = guild.levelUpMessage
          lvlMsg = lvlMsg.replace('{level}', member.level)
          lvlMsg = lvlMsg.replace('{user.name}', `${message.author.username}`)
          lvlMsg = lvlMsg.replace('{user.mention}', `<@!${message.author.id}>`)
          lvlMsg = lvlMsg.replace('{user.id}', `${message.author.id}`)
          lvlMsg = lvlMsg.replace('{user.discrim}', `${message.author.discriminator}`)
          lvlMsg = lvlMsg.replace('{nextExp}', member.expNeeded)
          try {
            message.channel.send(lvlMsg)
          } catch (e) {}
        }
      }
      member.save()
    }
  }
}