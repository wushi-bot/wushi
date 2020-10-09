const discord = require('discord.js')

module.exports.run = async (bot, msg, args) => {
  if (!args[0]) {
    const embed = new discord.MessageEmbed()
      .setColor('#77e86b')
      .setTitle(':convenience_store: Welcome to the Store')
      .setDescription('What can I do for you?\n\n:poultry_leg: **Food** → Can be consumable for stat boosts & other effects.\n:tools: **Tools** → The main way to get income with this bot.\n:up: **Upgrades** → Makes the game more easier to play & is permanent and stackable.\n:flower_playing_cards: **Collectables** → Fun little collectables that serve no purpose or meaning.\n\nDo `.shop <category>`, for example, `.shop food` to see the corresponding catalog of items.')
    msg.channel.send(embed)
  }
  if (args[0] === 'tools' || args[0] === 'Tools') {
    if (!args[1]) {
      const embed = new discord.MessageEmbed()
        .setColor('#77e86b')
        .setTitle(':convenience_store: Tools Catalog (page 1 of 2)')
        .setDescription('What do you wish to buy?\n\n:fishing_pole_and_fish: **Fishing Rod**, **Price: $100**, `.buy fishingrod` | Allows you to do `.fish` and make money from your reels.\n:pick: **Pickaxe**, **Price: $5,000**, `.buy pickaxe` | Allows you to do `.mine` and make money from your finds.\n:seedling: **Farm**, **Price: $35,000**, `.buy farm` | Allows you to do `.farm` and make money from your farming.\n:factory: **Factory**, **Price: $100,000**, `.buy factory` | Allows you to do `.work` and make money from working in a factory.')
        .setFooter('Buy an item using .buy <item>, Go to the next page using .shop tools 2')
      msg.channel.send(embed)
    }
    if (args[1] === '2') {
      const embed = new discord.MessageEmbed()
        .setColor('#77e86b')
        .setTitle(':convenience_store: Tools Catalog (page 2 of 2)')
        .setDescription('What do you wish to buy?\n\n:computer: **Laptop**, **Price: $1,000,000**, `.buy laptop` | Allows you to do `.code` and make money from Bitcoin mining.\n:cyclone: **Vortex**, **Price: $50,000,000**, `.buy vortex` | Allows you to do `.vortex` and make money from another dimension.\n:comet: **Comet Generator**, **Price: $1,000,000,000**, `.buy comet` | Allows you to do `.generate` and make money from thin air.\n:stars:  **Starlight Generator**, **Price: $1,000,000,000,000**, `.buy antimatter` | Allows you to do `.starlight` and make money from the starlight of the universe.')
        .setFooter('Buy an item using .buy <item>, Go to the next page using .shop tools 3')
      msg.channel.send(embed)
    }
  } else if (args[0] === 'food' || args[0] === 'Food') {
    const embed = new discord.MessageEmbed()
      .setColor('#77e86b')
      .setTitle(':convenience_store: Food Catalog (page 1 of 1)')
      .setDescription('What do you wish to buy?\n\n:apple: **ÜberFruit:tm:**, **Price: $250,000** `.buy uber` | Save up food using `.uber <amount>` and then burst your **Über Apple** to then get your money at a multiplied amount.\n:lock: **Kodo Gummi**, **Price: $15,000**, `.buy gummi` | Disables all tool durability loss for 2 minutes.\n:busts_in_silhouette: **Provato Cherry**, **Price: $50,000** `.buy provato` | Gives double earnings for any economy commands for **45s**.')
      .setFooter('Buy an item using .buy <item>, Go to the next page using .shop food 2')
    msg.channel.send(embed)
  }
}

module.exports.help = {
  name: 'shop',
  description: 'See the store.',
  category: 'Economy',
  aliases: ['store'],
  usage: 'shop [page]',
  cooldown: 0
}
