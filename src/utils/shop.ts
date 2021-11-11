import fs from 'fs'
import path from 'path'

export async function getCategories () {
  const lists = fs.readdirSync(path.join(__dirname, '../../src', '/resources/items/'), { withFileTypes: false })  
  let final = []
  for (let category of lists) { // @ts-ignore
    category = category.split('.').slice(0, -1).join('.')
    final.push(category)
  }
  return final
}

export async function getItems() {
  const lists = fs.readdirSync(path.join(__dirname, '../../src', '/resources/items/'), { withFileTypes: true })  
  let final = []
  for await (let list of lists) {
    let items = require(path.join(__dirname, '../../src', `/resources/items/${list.name}`))
    for await (let item of items) {
      final.push(item)
    }
  }
  return final
}

export async function getItem(item) {
  let returnedItem
  let items = await getItems()
  for (let val of items) {
    if (val.id === item) {
      returnedItem = val
    }
  }
  if (!returnedItem) return undefined
  return returnedItem
}