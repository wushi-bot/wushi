import Command from '../structs/command';

export default class PingCommand extends Command {
  name = 'ping'
  description = 'Gets the bot\'s latency.'
  category = 'Meta'
  aliases = ['ping-pong', 'ms']
  usage = 'ping'
  cooldown = 2.5

  async run (bot, message, args) {
    const msg = await message.channel.send('🏓 Ping!')
    msg.edit(`🏓 Pong! (:heart: Roundtrip took: ${message.createdTimestamp - msg.createdTimestamp}ms. 💙: ${Math.round(this.client.ws.ping)}ms.)`)
  }
}