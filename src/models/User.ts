import mongoose, { Schema } from 'mongoose'

export interface IUser extends mongoose.Document {
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
    rankCardColor: String,
    votedTop: Boolean,
    votedDBL: Boolean,
    started: Boolean,
    daily: Number,
    votes: Object,
    pets: Object
}

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
    rankCardColor: String,
    votedTop: Boolean,
    votedDBL: Boolean,
    started: Boolean,
    daily: Number,
    votes: Object,
    pets: Object
})

export default mongoose.model<IUser>('user', UserSchema)