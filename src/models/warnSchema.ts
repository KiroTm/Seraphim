import mongoose, { Document, Schema } from 'mongoose';

export interface WarnDocument extends Document {
    GuildID: string;
    UserID: string;
    StaffID: string;
    Reason: string;
}

const WarnSchema = new Schema({
    GuildID: { type: String, required: true },
    UserID: { type: String, required: true },
    StaffID: { type: String, required: true },
    Reason: { type: String, required: true }
}, { timestamps: true });

const name = 'warns';
export default mongoose.models[name] || mongoose.model<WarnDocument>(name, WarnSchema);
