import mongoose, { Schema } from "mongoose";
import { ModlogType } from "../classes/moderation/modlogs";
const ModlogSchema = new Schema({
    GuildID: { type: String, required: true },
    UserID: { type: String, required: true },
    StaffID: { type: String, required: true },
    Reason: { type: String, required: false, default: 'No reason given' },
    Type: { type: String, required: true}
}, {
    timestamps: true
})
export default mongoose.models['Modlogs'] || mongoose.model('Modlogs', ModlogSchema) 