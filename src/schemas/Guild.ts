import mongoose, { Schema } from 'mongoose'

const GuildSchema: Schema = new Schema({ 
    id: {
        type: String,
        required: true,
        unique: true
    },
    admins: Array,
    disabledCommands: Array,
    disabledModules: Array,
    leveling: Boolean,
    levelUpMessage: String,
    rewards: Array
})

export default mongoose.model('guild', GuildSchema)