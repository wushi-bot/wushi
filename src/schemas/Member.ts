import mongoose, { Schema } from 'mongoose'

const MemberSchema: Schema = new Schema({ 
    userId: {
        type: String,
        required: true
    },
    guildId: {
        type: String,
        required: true,
    },
    expNeeded: Number,
    exp: Number,
    level: Number,
    totalExp: Number,
    rankCardColor: String
})

export default mongoose.model('member', MemberSchema)