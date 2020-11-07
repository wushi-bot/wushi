import express from 'express'
import path from 'path'
import fs from 'fs'
import https from 'https'
import http from 'http'
import flash from 'connect-flash'
import session from 'express-session'
import chalk from 'chalk'
import db from 'quick.db'

const levels = new db.table('leveling')

/* App Setup */

const app = express()

// https://discord.com/api/oauth2/authorize?client_id=755526238466080830&redirect_uri=http%3A%2F%2Flocalhost%3A8000%2Flogin-discord&response_type=code&scope=identify%20guilds

app.set('view engine', 'pug')
app.use(express.static(path.join(__dirname, '/web/public')))
app.set('views', path.join(__dirname, '/web/views'))
app.use(session({
  cookie: { maxAge: 60000 },
  secret: 'keyboard cat',
  saveUninitialized: false,
  resave: false
}))
app.use(flash())
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success')
  res.locals.error_messages = req.flash('error')
  next()
})

/* Routes */
app.get('/', (req, res) => {
  return res.render('index')
})

app.get('/invite', (req, res) => {
  return res.redirect('https://discord.com/oauth2/authorize?client_id=755526238466080830&permissions=1275456512&scope=bot')
})

/*
app.get('/levels/:id?', (req, res) => {
  var id = req.params.id
  const server = bot.guilds.cache.get(id)
  if (!server) {
    return res.status(400)
  }
  const list = []
  levels.all().forEach(entry => {
    if (entry.ID === server.id) {
      for (var key in entry.data) {
        let member = server.members.cache.find(member => member.id === key)
        list.push({ ID: key, avatar: member.user.avatarURL(), username: member.user.username, totalExp: entry.data[key].totalExp, expNeeded: entry.data[key].expNeeded, exp: entry.data[key].exp, level: entry.data[key].level })
      }
    }
  })
  return res.render('levels', { serverName: server.name, users: list })
})*/

/* Startup server */

try {
  const privateKey = fs.readFileSync('/etc/letsencrypt/live//wushibot.xyz/privkey.pem', 'utf8')
  const certificate = fs.readFileSync('/etc/letsencrypt/live//wushibot.xyz/cert.pem', 'utf8')
  const ca = fs.readFileSync('/etc/letsencrypt/live/wushibot.xyz/chain.pem', 'utf8')
  const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
  }
  const httpsServer = https.createServer(credentials, app)
  httpsServer.listen(443, () => {
    console.log(chalk.green('>') + ' Server started listening on port 443!')
  })
} catch (e) {
  const httpServer = http.createServer(app)
  httpServer.listen(8888, () => {
    console.log(chalk.green('>') + ' Server started listening on port 8888!')
  })
}
