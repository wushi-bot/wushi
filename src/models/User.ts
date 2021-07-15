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
    embedColor: String
})

export default mongoose.model('user', UserSchema)