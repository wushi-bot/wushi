import mongoose, { Schema } from 'mongoose'

const UserSchema: Schema = new Schema({ 
    id: {
        type: String,
        required: true,
        unique: true
    },
    balance: Number,
    multiplier: Number,
    prestige: Number,
    items: Object,
    skills: Object,
    votedTop: Boolean,
    votedDBL: Boolean,
    started: Boolean,
    daily: Number,
    reputation: Object,
    weekly: Number,
    votes: Object,
    pets: Object,
    fishing_rod: String
})

export default mongoose.model('user', UserSchema)