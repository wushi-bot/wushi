const discord = require('discord.js')
const fs = require('fs')
const key = require('../emoji_key.json')

exports.run = (bot, message, args) => {
  const color = '#ffa3e5'
  if (!args[0]) {
    let props
    let categorys
    fs.readdir('./commands', (err, files) => {
      if (err) console.error(err)
      categorys = []
      files.forEach(f => {
        props = require(`./${f}`)
        if (!categorys[props.help.category]) {
          categorys[props.help.category] = []
          categorys[props.help.category].push(props.help.name)
        } else {
          categorys[props.help.category].push(props.help.name)
        }
      })
      const x = []
      const embed = new discord.MessageEmbed()
        .setTitle(':dog2: dogsong\'s commands')
        .setDescription('Here\'s a list of all my commands.')
      bot.commands.map(c => {
        if (!x[c.help.category]) {
          x[c.help.category] = []
        }
        if (x[c.help.category].length > 0) {
          return
        } else if (x[c.help.category].length === 0) {
          embed.addField(`${key[c.help.category]} ${c.help.category} Commands`, categorys[c.help.category].toString().replace('[', ' ').replace(']', ' ').replace(/,/gi, ', '))
        }
        x[c.help.category].push(1)
      })
      files.forEach(f => {
        props = require(`./${f}`)
        x[props.help.category] = []
        categorys[props.help.category] = []
      })
      embed.setTimestamp()
      embed.setColor(0xadd8e6)
      embed.setFooter(`Requested by ${message.author.username}`, message.author.avatarURL)
      message.channel.send({ embed })
    })
  } else {
    const embed = new discord.MessageEmbed()
    let command = args[0]
    if (bot.commands.has(command)) {
      command = bot.commands.get(command)
      let aliases = command.help.aliases.toString().replace(/[|]/gi, ' ').replace(/,/gi, ', ')
      if (!aliases) aliases = 'None'
      else aliases = command.help.aliases.toString().replace(/[|]/gi, ' ').replace(/,/gi, ', ')
      embed.setAuthor(command.help.name.toUpperCase())
        .setColor(color)
        .setFooter(`Requested by ${message.author.username}`, message.author.avatarURL(), true)
        .addField('Description', command.help.description, true)
        .addField('Usage', `\`${command.help.usage}\``, true)
        .addField('Category', command.help.category, true)
        .addField('Aliases', aliases, true)
      message.channel.send({ embed })
    }
  }
}

module.exports.help = {
  name: 'help',
  description: 'Grabs a list of one or many commands.',
  aliases: ['commands', 'cmd', 'cmds', 'assistanceplzdoktor'],
  category: 'Meta',
  usage: 'help [command]',
  cooldown: 0
}
