import { MessageEmbed } from 'discord.js'

module.exports.run = (bot, error) => {
  const embed = new MessageEmbed()
    .setTitle(':x: There has been an error!')
    .setDescription('```' + error + '```')
    .addField('Stack', '```' + error.stack + '```')
    .setFooter('Please attempt to fix this soon!')
    .setAuthor('minota#0001', 'https://cdn.discordapp.com/avatars/488786712206770196/e266d53607c1eab253b9e6000b4ab902.png?size=2048')
    .setColor('#ff2d08')
  bot.channels.cache.get('778067624029847585').send(embed)
}
