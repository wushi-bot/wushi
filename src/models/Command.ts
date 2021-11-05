import { SlashCommandBuilder } from '@discordjs/builders'

export default class Command extends SlashCommandBuilder {
    constructor(name: string, description: string) {
        super()
        this.setName(name)
        this.setDescription(description)
    }
}