import mongoose, { Schema, Document } from "mongoose";

export interface IMessageData {
    UserID: string;
    Date: number;
}

export interface IMessageDocument extends Document {
    GuildID: string;
    Collection: Map<string, IMessageData>;
    Lookback: string;
}

const StatsSchema = new Schema({
    GuildID: { type: String },
    Collection: [
        {
            UserID: String,
            Date: Number,
            MessageId: String,
            ChannelId: String
        }
    ],
    Lookback: { type: String, default: 7 }
});
const name = 'Stats-log';
export default mongoose.models[name] || mongoose.model<IMessageDocument>(name, StatsSchema);
