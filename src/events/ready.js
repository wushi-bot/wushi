import chalk from 'chalk'
import express from 'express'
import bodyParser from 'body-parser'

const app = express()
app.use(bodyParser.json())

app.post('/dblHook', (req, res) => {
  console.log(req.body)
  res.status(200).end()
})

app.listen(process.env.PORT, () => {})

module.exports.run = (bot) => {
  bot.logger.log('info', `Ready! Logged in as ${bot.user.username}#${bot.user.discriminator}`)
  console.log(chalk.black('────────────────────────────────────────────────────────────'))
  bot.user.setActivity('.help | .support', { type: 'LISTENING' })

}