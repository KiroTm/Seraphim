import mongoose, { Schema } from "mongoose";
const AfkSchema = new Schema({
    GuildID: {type: String},
    UserID: {type: String},
    Reason: {type: String, default: "AFK"},
    Mentions: {type: Array, default: []}
},{
    timestamps: true
})
const name = 'Afk-Logs'
export default mongoose.models[name] || mongoose.model(name, AfkSchema)  
