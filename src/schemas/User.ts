import mongoose, { Schema } from 'mongoose'

const UserSchema: Schema = new Schema({ 
    id: {
        type: String,
        required: true,
        unique: true
    },
    balance: Number,
    bank: Number,
    multiplier: Number,
    prestige: Number,
    items: Object,
    skills: Object,
    embedColor: String,
    votedTop: Boolean,
    votedDBL: Boolean,
    started: Boolean,
    daily: Number,
    weekly: Number,
    votes: Object,
    pets: Object
})

export default mongoose.model('user', UserSchema)