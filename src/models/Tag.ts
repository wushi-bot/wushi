import mongoose, { Schema } from 'mongoose'

const TagSchema: Schema = new Schema({ 
    name: {
      type: String,
      required: true
    },
    guildId: {
      type: String,
      required: true
    },
    content: String
})

export default mongoose.model('tag', TagSchema)