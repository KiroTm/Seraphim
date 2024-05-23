import { Interaction } from "discord.js";
import { ConfigInstance } from "../../../../../OldHandler/ConfigHandler";
import { TicketSetupClass } from "../../../../Classes/Tickets/Setup";
const ticketSetupClass = TicketSetupClass.getInstance()
export default async (instance: ConfigInstance, interaction: Interaction) => {
    //@ts-ignore
    console.log(interaction?.customId ?? undefined)
}