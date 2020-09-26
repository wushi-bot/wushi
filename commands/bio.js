const axios = require('axios')
const discord = require('discord.js')

exports.run = (bot, msg, args) => {
  let user = args[0]
  if (!user) {
      user = msg.author.id
  }
  axios.get(`https://api.discord.bio/user/details/${user}`).then(res => {
    const e = new discord.MessageEmbed()
    const settings = res.data.payload.discord
    const bio = res.data.payload.user
    console.log(bio)
    e.setTitle(`${settings.username}'s Profile`)
    e.addField(':name_badge: Username', `${settings.username} (\`${settings.id}\`)`, true)
    if (bio.details.premium_Type == 1) {
        e.addField(':gem: Premium', `Premium!`, true)
    } else {
        e.addField(':gem: Premium', `That person isn't premium!`, true)
    }
    if (bio.details.verified) {
        e.addField(':white_check_mark: Verified', `Verified!`, true)
    } else {
        e.addField(':white_check_mark: Verified', `That person isn't verified!`, true)
    }    
    e.addField(':map: Location', `${bio.details.location}`, true)
    if (bio.details.description) {
        e.addField(':scroll: Description', `${bio.details.description}`, true)
    } else {
        e.addField(':scroll: Description', `This user prefers to stay quiet.`, true)
    }

    e.addField(':bust_in_silhouette: Occupation', `${bio.details.occupation}`, true)
    e.addField(':up: Upvotes', `\`${bio.details.likes}\` :thumbsup:`)
    if (bio.details.gender == 0) {
        e.addField(':male_sign: Gender', `Male`, true)
    } else {
        e.addField(':female_sign: Gender', `Female`, true)
    }    

    e.setFooter(`Requested by ${msg.author.username}`, msg.author.avatarURL())
    e.setImage(bio.details.banner)
    e.setColor('#36393f')
    msg.channel.send(e)
    
  })
}

exports.help = {
  name: 'bio',
  aliases: ['d-bio', 'discord.bio', 'dsc-bio']
}