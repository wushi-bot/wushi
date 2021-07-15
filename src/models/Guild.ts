import mongoose, { Schema } from 'mongoose'

const GuildSchema: Schema = new Schema({ 
    guildId: {
        type: String,
        required: true,
        unique: true
    },
    prefix: String,
    leveling: Boolean,
    admins: Array,
    disabledCommands: Array,
    disabledModules: Array
})

export default mongoose.model('guild', GuildSchema)