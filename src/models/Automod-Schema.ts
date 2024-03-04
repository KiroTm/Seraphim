import mongoose, { Schema } from "mongoose";

const AutomodSchema = new Schema({
    GuildID: { type: String, required: true },
    BannedWords: {
            
    }
});

export default mongoose.models['Automod'] || mongoose.model('Automod', AutomodSchema);