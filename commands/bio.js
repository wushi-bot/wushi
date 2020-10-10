import axios from 'axios'
import discord from 'discord.js'
import Command from '../models/Command'

class Bio extends Command {
  constructor (client) {
    super(client, {
      name: 'bio',
      description: 'Gets information about a user\'s (or slug\'s) discord.bio data.',
      usage: 'bio [slug or ID]',
      category: 'Util',
      aliases: ['d-bio', 'discord.bio', 'dsc-bio'],
      cooldown: 10
    })
  }

  async run (bot, msg, args) {
    let user = args[0]
    if (!user) {
      user = msg.author.id
    }
    axios.get(`https://api.discord.bio/user/details/${user}`).then(res => {
      const e = new discord.MessageEmbed()
      const settings = res.data.payload.discord
      const bio = res.data.payload.user
      e.setTitle(`${settings.username}'s Profile`)
      e.addField(':name_badge: Username', `${settings.username} (\`${settings.id}\`)`, true)
      if (bio.details.premium_Type === 1) {
        e.addField(':gem: Premium', 'Premium!', true)
      }
      if (bio.details.verified) {
        e.addField(':white_check_mark: Verified', 'Verified!', true)
      }
      if (bio.details.location) {
        e.addField(':map: Location', `${bio.details.location}`, true)
      }
      if (bio.details.description) {
        e.addField(':scroll: Description', `${bio.details.description}`, true)
      }
      if (bio.details.occupation) {
        e.addField(':bust_in_silhouette: Occupation', `${bio.details.occupation}`, true)
      }
      e.addField(':up: Upvotes', `\`${bio.details.likes}\` :thumbsup:`)
      if (bio.details.gender === 0) {
        e.addField(':male_sign: Gender', 'Male', true)
      } else {
        e.addField(':female_sign: Gender', 'Female', true)
      }
      e.setFooter(`Requested by ${msg.author.username}`, msg.author.avatarURL())
      e.setImage(bio.details.banner)
      e.setColor('#36393f')
      msg.channel.send(e)
    })
  }
}

module.exports = Bio
