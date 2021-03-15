
import req from '@aero/centra'

exports.run = async (bot, error, message) => {
  const img = await req(bot.carbonaraURL)
    .method('POST')
    .path('/api/cook')
    .body({
      code: error, 
      language: 'auto',
      fontFamily: 'Monokai',
      windowControls: false
    }, 'json')
    .raw()
  message.reply({ files: [{ attachment: img, name: 'card.png' }] })
}