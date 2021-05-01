import Command from '../../structs/command'

const clean = text => {
  if (typeof (text) === 'string') {
    return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203))
  } else {
    return text
  }
}

class EvalCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'evaluate',
      description: '...',
      category: 'Admin',
      aliases: ['eval', 'e'],
      usage: 'eval <statement>',
      cooldown: 1
    })
  }

  async run (bot, msg, args) {
    if (!args[0]) return msg.channel.send('You need a statement to run.')
    if (msg.author.id !== '488786712206770196') return
    const evaluation = args.join(' ').replace(/--noPromise/g, '').replace('```js', '').replace('```', '')
    try {
      let evaled = eval(evaluation)
      if (typeof evaled !== 'string') {
        evaled = require('util').inspect(evaled)
        var oe = evaled
        var regex = new RegExp('```', 'g')

        evaled.replace(regex, '')
        if (msg.content.includes('--noPromise')) evaled = evaled.replace(/Promise { <pending> }/g, '')

        if (clean(evaled).length !== 0) {
          msg.channel.send(clean(evaled), { code: evaled.includes('Promise { <pending> }') ? 'js' : 'xl' })
        }
      }
    } catch (err) {
      msg.channel.send(`\❌ \`\`\`js\n${clean(err)}\n\`\`\``)
    }
  }
}

module.exports = EvalCommand