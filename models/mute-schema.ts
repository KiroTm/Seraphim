import mongoose, { Schema } from "mongoose";
export interface MuteInterface {
    reason?: string,
    expiresAt?: Date,
    roles?: Array<string>
}
const muteschema = new Schema({
    GuildID: { type: String },
    UserID: { type: String },
    Reason: { type: String, default: "no reason given" },
    expiresAt: { type: Date, default: null },
    roles: { type: Array }
})
const name = 'Mute-Logs'
export default mongoose.models[name] || mongoose.model(name, muteschema)  
