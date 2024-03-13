import mongoose, { Schema } from "mongoose";

const MarriageSchema = new Schema({
    GuildID: { type: String, required: true },
    Marriages: [
        {
            Members: { type: [String], required: true },
            Date: { type: Date, required: true },
        },
    ],
});

export default mongoose.models['Marriage'] || mongoose.model('Marriage', MarriageSchema);
