import express from 'express'
import path from 'path'
import fs from 'fs'
import https from 'https'
import http from 'http'
import url from 'url'
import flash from 'connect-flash'
import session from 'express-session'
import chalk from 'chalk'
import passport from 'passport'
import bodyParser from 'body-parser'
import 'dotenv/config'
import { Permissions } from 'discord.js'
import utils from './utils/utils'

import db from 'quick.db'
const cfg = new db.table('config')
const levels = new db.table('leveling')

const Strategy = require('passport-discord').Strategy
const MemoryStore = require('memorystore')(session)

/* App Setup */

const app = express()

module.exports = async (client) => {
  app.set('view engine', 'pug')
  app.use(express.static(path.join(__dirname, '/web/public')))
  app.set('views', path.join(__dirname, '/web/views'))

  passport.serializeUser((user, done) => done(null, user))
  passport.deserializeUser((obj, done) => done(null, obj))

  passport.use(new Strategy({
    clientID: '755526238466080830',
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.DOMAIN + '/callback',
    scope: ['identify', 'guilds']
  },
  (accessToken, refreshToken, profile, done) => {
    process.nextTick(() => done(null, profile))
  }))

  app.use(session({
    store: new MemoryStore({ checkPeriod: 86400000 }),
    secret: '#@%#&^$^$%@$^$&%#$%@#$%$^%&$%^#$%@#$%#E%#%@$FEErfgr3g#%GT%536c53cc6%5%tv%4y4hrgrggrgrgf4n',
    resave: false,
    saveUninitialized: false
  }))
  app.use(flash())
  app.use((req, res, next) => {
    res.locals.success_messages = req.flash('success')
    res.locals.error_messages = req.flash('error')
    next()
  })

  app.use(passport.initialize())
  app.use(passport.session())
  app.locals.domain = process.env.DOMAIN + '/callback'.split('//')[1]
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({
    extended: true
  }))

  const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) return next()
    req.session.backURL = req.url
    res.redirect('/login')
  }

  // bot: client,
  // path: req.path,
  // user: req.isAuthenticated() ? req.user : null

  /* Routes */

  app.get('/login', async (req, res, next) => {
    // We determine the returning url.
    if (req.session.backURL) {
      req.session.backURL = req.session.backURL // eslint-disable-line no-self-assign
    } else if (req.headers.referer) {
      const parsed = url.URL(req.headers.referer)
      if (parsed.hostname === app.locals.domain) {
        req.session.backURL = parsed.path
      }
    } else {
      req.session.backURL = '/'
    }
    // Forward the request to the passport middleware.
    next()
  },
  passport.authenticate('discord'))

  app.get('/logout', function (req, res) {
    req.session.destroy(() => {
      req.logout()
      res.redirect('/')
    })
  })

  app.get('/callback', passport.authenticate('discord', { failureRedirect: '/' }), (req, res) => {
    // If user had set a returning url, we redirect him there, otherwise we redirect him to index.
    if (req.session.backURL) {
      const url = req.session.backURL
      req.session.backURL = null
      res.redirect(url)
    } else {
      res.redirect('/')
    }
  })

  app.get('/dashboard/:guildID', checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID)
    if (!guild) return res.redirect('https://discord.com/oauth2/authorize?client_id=755526238466080830&permissions=1275456512&scope=bot')
    const member = guild.members.cache.get(req.user.id)
    if (!member) return res.redirect('/dashboard')
    if (!member.permissions.has('MANAGE_GUILD')) return res.redirect('/dashboard')
    let levelUpMessage = cfg.get(`${guild.id}.levelUpMessage`)
    levelUpMessage = levelUpMessage || 'Congratulations, **{user.name}**, you\'ve leveled :up: to **Level {level}**!'
    let rankCardColor = cfg.get(`${guild.id}.rankCardColor`)
    rankCardColor = rankCardColor || '#ff3f38'
    res.render('settings', { prefix: utils.getPrefix(guild.id), cardColor: rankCardColor, id: guild.id, server: guild, name: guild.name, lvlMsg: levelUpMessage, bot: client, path: req.path, user: req.isAuthenticated() ? req.user : null, perms: Permissions })
  })

  app.get('/levels/:id?', (req, res) => {
    var id = req.params.id
    const server = client.guilds.cache.get(id)
    if (!server) {
      return res.status(400).redirect('/')
    }
    const list = []
    levels.all().forEach(entry => {
      if (entry.ID === server.id) {
        for (var key in entry.data) {
          const member = server.members.cache.find(member => member.id === key)
          list.push({ ID: key, avatar: member.user.avatarURL(), username: member.user.username, totalExp: entry.data[key].totalExp, expNeeded: entry.data[key].expNeeded, exp: entry.data[key].exp, level: entry.data[key].level })
        }
      }
    })
    return res.render('levels', { serverId: server.id, serverName: server.name, users: list })
  })

  app.post('/dashboard/:guildID', checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID)
    if (!guild) return res.redirect('/dashboard')
    const member = guild.members.cache.get(req.user.id)
    if (!member) return res.redirect('/dashboard')
    if (!member.permissions.has('MANAGE_GUILD')) return res.redirect('/dashboard')
    const newPrefix = req.body.prefix
    const newLevelUpMessage = req.body.levelUpMessage
    const newRankCardColor = req.body.rankCardColor
    if (!newLevelUpMessage || newLevelUpMessage !== cfg.get(`${req.params.guildID}.levelUpMessage`)) {
      cfg.set(`${req.params.guildID}.levelUpMessage`, newLevelUpMessage)
    }
    if (!newPrefix || newPrefix !== cfg.get(`${req.params.guildID}.prefix`)) {
      cfg.set(`${req.params.guildID}.prefix`, newPrefix)
    }
    if (!newRankCardColor || newRankCardColor !== cfg.get(`${req.params.guildID}.rankCardColor`)) {
      cfg.set(`${req.params.guildID}.rankCardColor`, newRankCardColor)
    }
    let levelUpMessage = cfg.get(`${guild.id}.levelUpMessage`)
    levelUpMessage = levelUpMessage || 'Congratulations, **{user.name}**, you\'ve leveled :up: to **Level {level}**!'
    let rankCardColor = cfg.get(`${guild.id}.rankCardColor`)
    rankCardColor = rankCardColor || '#ff3f38'
    req.flash('success', 'Successfully saved changes.')
    res.render('settings', { prefix: utils.getPrefix(guild.id), cardColor: rankCardColor, id: guild.id, server: guild, name: guild.name, lvlMsg: levelUpMessage, bot: client, path: req.path, user: req.isAuthenticated() ? req.user : null, perms: Permissions })
  })

  app.get('/dashboard', checkAuth, async (req, res) => {
    return res.render('dashboard', { bot: client, path: req.path, user: req.isAuthenticated() ? req.user : null, perms: Permissions })
  })

  app.get('/', async (req, res) => {
    return res.render('index', { user: req.isAuthenticated() ? req.user : null })
  })

  app.get('/invite', async (req, res) => {
    return res.redirect('https://discord.com/oauth2/authorize?client_id=755526238466080830&permissions=1275456512&scope=bot')
  })

  app.get('/vote', async (req, res) => {
    return res.redirect('https://top.gg/bot/755526238466080830/vote')
  })

  app.get('/support', async (req, res) => {
    return res.redirect('https://discord.com/invite/zwmqwjrxR9')
  })

  app.get('/variables', async (req, res) => {
    return res.render('variables')
  })

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
      client.logger.log('info', '[Web] Server started listening on port 443!')
    })
  } catch (e) {
    const httpServer = http.createServer(app)
    httpServer.listen(8888, () => {
      client.logger.log('info', '[Web] Server started listening on port 8888!')
    })
  }
}
