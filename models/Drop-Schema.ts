import mongoose, { Schema } from "mongoose";
const DropsSchema = new Schema({
    GuildID: { type: String, required: true },
    ChannelID: { type: String, required: true },
    ItemCollection: [
        {
            UserID: String,
            Crates: [
                {
                    name: String,
                    amount: Number
                }
            ]
        }
    ]
});

export default mongoose.models['Drops'] || mongoose.model('Drops', DropsSchema);
