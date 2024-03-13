import { TextChannel } from "discord.js";
import { ConfigHandler } from "../../../Main-Handler/ConfigHandler";
import TicketSchema from '../../models/tickets-schema';
export default async (instance: ConfigHandler, channel: TextChannel) => {
    const data = TicketSchema.findOne({
        ChannelID: channel.id
    })
    if (data) {
        await data.findOneAndUpdate({
            ChannelID: channel.id
        },
        {
            HasTicket: false
            
        },
        {
            upsert: true
        })
    } else {
        return;
    }   
}