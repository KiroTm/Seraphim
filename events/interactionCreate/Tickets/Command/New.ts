import { Interaction } from "discord.js";
import { ConfigInstance } from "../../../../Main-Handler/ConfigHandler";
import { TicketSetupClass } from "../../../../classes/Tickets/Setup";
const ticketSetupClass = TicketSetupClass.getInstance()
export default async (instance: ConfigInstance, interaction: Interaction) => {
    //@ts-ignore
    console.log(interaction?.customId ?? undefined)
}