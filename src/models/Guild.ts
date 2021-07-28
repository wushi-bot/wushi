import mongoose, { Schema } from 'mongoose'

const GuildSchema: Schema = new Schema({ 
    id: {
        type: String,
        required: true,
        unique: true
    },
    prefix: String,
    admins: Array,
    mods: Array,
    disabledCommands: Array,
    disabledModules: Array,
    leveling: Boolean,
    levelUpMessage: String
})

export default mongoose.model('guild', GuildSchema)