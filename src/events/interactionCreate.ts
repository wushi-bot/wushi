import { Interaction } from "discord.js"
import Bot from "src/models/Client"

exports.run = async (bot: Bot, interaction: Interaction) => {
    if (!interaction.isCommand()) return
    const command = bot.commands.get(interaction.commandName)
    if (!command) return
    try {
        bot.logger.info(`Executing the slash command /${interaction.commandName} for ${interaction.member.user.id} in ${interaction.guild.id}.`)
        await command.execute(interaction, bot)
    } catch (error) {
        console.error(error)
        bot.logger.error(`There was was an error executing the slash command /${interaction.commandName} for ${interaction.member.user.id} in ${interaction.guild.id}, ${error}`)
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
    }
}