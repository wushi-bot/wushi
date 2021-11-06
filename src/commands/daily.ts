import { CommandInteraction } from 'discord.js'

import { getUser } from '../utils/database'
import { addMoney } from '../utils/economy'
import { addCommas } from '../utils/functions'

import ms from 'ms'
import Bot from '../models/Client'
import Command from '../models/Command'

class DailyCommand extends Command {
  constructor() {
    super(
      'daily', 
      'Gives the user their daily amount of coins if not on cooldown.'
    )
  }

  async execute(interaction: CommandInteraction, client: Bot) {
    const user = await getUser(interaction.member.user.id)
    let time = new Date().getTime()
    if (user.daily) {
      if (user.daily >= time) {
        return await interaction.reply({ content: `You're still on cooldown for this command! Please wait **<t:${Math.floor(user.daily / 1000)}:R>**.` })
      }
      const amount = await addMoney(interaction.member.user.id, 500)
      user.daily = new Date().getTime() + 86400000
      user.save()
      return await interaction.reply({ content: `Successfully claimed :coin: **${await addCommas(amount)}** for today, you can claim this again in **${ms(user.daily - time, { long: true })}**.` })
    } else {
      const amount = await addMoney(interaction.member.user.id, 500)
      user.daily = new Date().getTime() + 86400000
      user.save()
      return await interaction.reply({ content: `Successfully claimed :coin: **${await addCommas(amount)}** for today, you can claim this again in **${ms(user.daily - time, { long: true })}**.` })
    }
  }
}

module.exports = DailyCommand