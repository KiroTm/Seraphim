import mongoose, { Schema, Document } from "mongoose";
const TicketChannelSchema = new Schema({
    GuildID: {required: true, type: String},    
    Type: {required: false, type: String, default: "Support Ticket"},
    Category: {required: false, type: String},
    Transcripts: {required: false, type: String, default: "None"},
    Handlers: {required: false, type: Array<string>},
    Description: {require: false, type: String, default: "To create a ticket, click the button below"},
    Button: {type: String, required: false, default: "Ticket"},
    Emoji: {type: String, required: false, default: "🎟️"},
    SetupDone: { required: false, type: Boolean, default: false }
})
const name = 'TicketSetup'
export default mongoose.models[name] || mongoose.model(name, TicketChannelSchema)     