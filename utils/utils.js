const db = require('quick.db')
const economy = new db.table('economy')
const cfg = new db.table('config')
const leveling = new db.table('leveling')

module.exports.addMoney = function (a, id) {
  const mb = Math.floor(a * 0.10)
  const chance = this.getRandomInt(1, 3)
  if (chance === 1) {
    economy.add(`${id}.maxBank`, mb)
  }
  if (!economy.get(`${id}.effects`)) {
    economy.add(`${id}.balance`, a)
    return a
  }
  if (economy.get(`${id}.effects`).includes('doubling')) {
    economy.add(`${id}.balance`, a * 2)
    return a * 2
  } else {
    economy.add(`${id}.balance`, a)
    return a
  }
}

module.exports.getItem = function (arr, value) {
  let returnedItem
  arr.forEach(item => {
    if (item.id === value) {
      returnedItem = item
    }
  })
  return returnedItem
}

module.exports.addCommas = function (nStr) {
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

module.exports.checkLevel = function (id, serverId) {
  if (!leveling.get(`${id}.${serverId}.expNeeded`)) {
    leveling.set(`${id}.${serverId}.expNeeded`, 100)
  }
  if (!leveling.get(`${id}.${serverId}.level`)) {
    leveling.set(`${id}.${serverId}.level`, 0)
  }
  if (!leveling.get(`${id}.${serverId}.exp`)) {
    leveling.set(`${id}.${serverId}.exp`, 0)
  }
}

module.exports.getRandomInt = function (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}

module.exports.toTitleCase = function (str) {
  return str.replace(
    /\w\S*/g,
    function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    }
  )
}

// https://github.com/tekoh/nypsi/blob/master/utils/utils.js

module.exports.getMember = function (message, memberName) {
  if (!message.guild) return null

  const members = message.guild.members.cache

  let target
  const possible = new Map()

  for (let member of members.keyArray()) {
    member = members.get(member)
    if (member.user.id === memberName) {
      target = member
      break
    } else if (member.user.tag.toLowerCase() === memberName.toLowerCase()) {
      target = member
      break
    } else if (member.user.username.toLowerCase() === memberName.toLowerCase()) {
      if (member.user.bot) {
        possible.set(3, member)
      } else {
        possible.set(0, member)
      }
    } else if (member.user.tag.toLowerCase().includes(memberName.toLowerCase())) {
      if (member.user.bot) {
        possible.set(4, member)
      } else {
        possible.set(1, member)
      }
    } else if (member.displayName.toLowerCase().includes(memberName.toLowerCase())) {
      if (member.user.bot) {
        possible.set(5, member)
      } else {
        possible.set(2, member)
      }
    }
  }

  if (!target) {
    if (possible.get(0)) {
      target = possible.get(0)
    } else if (possible.get(1)) {
      target = possible.get(1)
    } else if (possible.get(2)) {
      target = possible.get(2)
    } else if (possible.get(3)) {
      target = possible.get(3)
    } else if (possible.get(4)) {
      target = possible.get(4)
    } else if (possible.get(5)) {
      target = possible.get(5)
    } else {
      target = null
    }
  }

  return target
}

module.exports.removeA = function (arr) {
  const a = arguments
  let L = a.length
  let ax
  const what = a[--L]
  if ((ax = arr.indexOf(what)) !== -1) {
    arr.splice(ax, 1)
  }
  return arr
}

module.exports.getPrefix = function (id) {
  if (!cfg.get(`${id}.prefix`)) {
    return '.'
  } else {
    return cfg.get(`${id}.prefix`)
  }
}
