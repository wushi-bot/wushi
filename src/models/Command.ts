import { SlashCommandBuilder } from '@discordjs/builders'

export default class Command extends SlashCommandBuilder {
    json: any
    constructor(name: string, description: string) {
        super()
        this.setName(name)
        this.setDescription(description)
        this.json = this.toJSON()
    }
    
}