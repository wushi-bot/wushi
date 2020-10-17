import Command from '../models/Command'
import db from 'quick.db'
import utils from '../utils/utils'
const config = new db.table('config')

const modules = ['Leveling', 'Meta', 'Server Shop', 'Economy', 'Util', 'Config']

class Toggle extends Command {
  constructor (client) {
    super(client, {
      name: 'toggle',
      description: 'Enable/disable modules.',
      category: 'Config',
      aliases: [],
      usage: 'toggle <module>',
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    if (!msg.member.hasPermission('ADMINISTRATOR') && !msg.member.hasPermission('MANAGE_GUILD')) return msg.channel.send(':x: You are missing the permission `Administrator` or `Manage Server`.')
    if (!args[0]) return msg.channel.send(':x: I require a valid module to toggle.')
    let input
    if (args[1]) {
      input = args.join(' ')
    } else {
      input = args[0]
    }
    const module = utils.toTitleCase(input.toLowerCase())
    if (module === 'Meta' || module === 'Config') return msg.channel.send(':x: That module cannot be disabled.')
    if (!modules.includes(module)) return msg.channel.send(':x: That module isn\'t a module.')
    if (config.get(`${msg.guild.id}.disabled`).includes(module)) {
      const o = config.get(`${msg.guild.id}.disabled`)
      const newList = utils.removeA(o, module)
      config.set(`${msg.guild.id}.disabled`, newList)
      return msg.channel.send(`:white_check_mark: \`${module}\` has been successfully **enabled**.`)
    } else {
      config.push(`${msg.guild.id}.disabled`, module)
      return msg.channel.send(`:white_check_mark: \`${module}\` has been successfully **disabled**.`)
    }
  }
}

module.exports = Toggle
