import DBL from 'dblapi.js'
const dbl = new DBL(process.env.DBL_TOKEN, { webhookPort: 6000, webhookAuth: '123' })

import keys from '../resources/key.json'
import tools from '../resources/items/tools.json'
import upgrades from '../resources/items/upgrades.json'
import fishing from '../resources/items/fishing.json'
import mining from '../resources/items/mining.json'
import farming from '../resources/items/farming.json'
import hunting from '../resources/items/hunting.json'
import petstuff from '../resources/items/petstuff.json'

import Guild from '../models/Guild'
import Member from '../models/Member'
import User from '../models/User'
import { checkUser } from './database'

export const updateStats = function (guildCount) {
  return dbl.postStats(guildCount)
}

export const getPrefix = async function (guildId) {
  const guilds = await Guild.find({
    id: guildId
  }).exec()
  if (guilds.length > 0) {
    return guilds[0].prefix
  } else {
    return '.'
  }
}

export const getColor = async function (bot, member) {
  const users = await User.find({
    id: member.user.id
  }).exec()
  if (users.length > 0) {
    const color = users[0].embedColor || member.roles.highest.color
    return color
  } else {
    checkUser(bot, member.user.id)
    return member.roles.highest.color
  }
}

export const getCategories = function () {
  const categories = []
  for (const category in keys) {
    if (category) categories.push(category)
  }
  return categories
}

export const checkLevel = async function (id, serverId) {
  const members = await Member.find({
    guildId: serverId,
    userId: id
  }).exec()
  if (members.length > 0) {
    return 
  } else {
    const newMember = new Member({
      guildId: serverId,
      userId: id,
      level: 0,
      exp: 0,
      expNeeded: 100,
      totalExp: 0
    })
    newMember.save()
  }
}

export const toTitleCase = function (str) {
  return str.replace(
    /\w\S*/g,
    function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    }
  )
}

export const removeA = function (arr) {
  const a = arguments
  let L = a.length
  let ax
  const what = a[--L]
  if ((ax = arr.indexOf(what)) !== -1) {
    arr.splice(ax, 1)
  }
  return arr
}

export const abbreviationToNumber = function (val) {
  if (isNaN(val)) {
    let multiplier = val.substr(-1).toLowerCase()
    if (multiplier == 'k')
      return parseFloat(val) * 1000
    else if (multiplier === 'm')
      return parseFloat(val) * 1000000
    else if (multiplier === 'b')
      return parseFloat(val) * 1000000000
  } else {
    return val
  }
}

export const getRandomInt = function (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}

export const getItem = function (arr, value) {
  let returnedItem
  arr.forEach(item => {
    if (item.id === value) {
      returnedItem = item
    }
  })
  if (!returnedItem) return undefined
  return returnedItem
}

export const getPet = function (arr, value) {
  let returnedItem
  arr.forEach(pet => {
    if (pet.id === value) {
      returnedItem = pet
    }
  })
  if (!returnedItem) return undefined
  return returnedItem
}

export const allItems = function () {

  const allItems = []
  for (const item in tools) {
    allItems.push(tools[item])
  }
  for (const item in upgrades) {
    allItems.push(upgrades[item])
  }   
  for (const item in petstuff) {
    allItems.push(petstuff[item])
  }    
  for (const item in fishing) {
    allItems.push(fishing[item])
  }      
  for (const item in mining) {
    allItems.push(mining[item])
  }   
  for (const item in farming) {
    allItems.push(farming[item])
  }
  for (const item in hunting) {
    allItems.push(hunting[item])
  }
  return allItems
}

export const addCommas = function (nStr) {
  nStr += ''
  var x = nStr.split('.')
  var x1 = x[0]
  var x2 = x.length > 1 ? '.' + x[1] : ''
  var rgx = /(\d+)(\d{3})/
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2')
  }
  return x1 + x2
}