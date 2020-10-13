import express from 'express'
import path from 'path'
import fs from 'fs'
import https from 'https'
import http from 'http'
import flash from 'connect-flash'
import session from 'express-session'
import chalk from 'chalk'

/* App Setup */

const app = express()

// https://discord.com/api/oauth2/authorize?client_id=755526238466080830&redirect_uri=http%3A%2F%2Flocalhost%3A8000%2Flogin-discord&response_type=code&scope=identify%20guilds

app.set('view engine', 'pug')
app.use(express.static(path.join(__dirname, '/web/public')))
app.set('views', '/web/views')
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
  return res.send('Hello!')
})

/* Startup server */

try {
  const privateKey = fs.readFileSync('/', 'utf8')
  const certificate = fs.readFileSync('/', 'utf8')
  const ca = fs.readFileSync('/', 'utf8')
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
  httpServer.listen(8000, () => {
    console.log(chalk.green('>') + ' Server started listening on port 8000!')
  })
}
