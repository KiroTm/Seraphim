import mongoose, { Schema } from 'mongoose'
const WarnSchema = new Schema({
    GuildID: {type: String},
    UserID: {typing: String},
    StaffID: {typing: String},
    Reason: {typing: String}
  },
  {
    timestamps: true,
})
const name = 'warns'
export default mongoose.models[name] || mongoose.model(name, WarnSchema)