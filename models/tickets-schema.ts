import mongoose, { Schema } from "mongoose";

const reqString = {
    type: String,
    required: true
}

const reqBoolean = {
    type: Boolean,
    required: true
}

const NotReqString = {
    type: String,
    required: false
}

const NotReqTime = {
    type: Number,
    required: false
}


const TicketSchema = new Schema({
    GuildID: reqString,
    MemberID: [reqString],
    TicketID: reqString,
    ChannelID: reqString,
    Closed: reqBoolean,
    Locked: reqBoolean,
    Type: reqString,
    Claimed: reqBoolean,
    ClaimedBy: reqString,
    HasTicket: reqBoolean,
    TranscriptLink: NotReqString,
    Time: NotReqTime
})
    
const name = 'Tickets-Info'

export default mongoose.models[name] ||
 mongoose.model(name, TicketSchema)  
