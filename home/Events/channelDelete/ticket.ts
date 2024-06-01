import { TextChannel } from "discord.js";
import { ConfigHandler } from "../../../NeoHandler/ConfigHandler";
import TicketSchema from '../../Models/tickets-schema';
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