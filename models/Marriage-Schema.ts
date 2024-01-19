import mongoose, { Schema } from "mongoose";

const MarriageSchema = new Schema({
    GuildID: { type: String, required: true },
    Members: [{ type: String, required: true}]
});

export default mongoose.models['Marriage'] || mongoose.model('Marriage', MarriageSchema);