import { Interaction } from "discord.js";
import { ConfigInstance } from "../../../../../Main-Handler/ConfigHandler";

export default async (instance: ConfigInstance, interaction: Interaction) => {
    if (!interaction.isButton()) return;
    if (!(interaction.customId.startsWith(`${interaction.guildId}Automod_Setup`) && interaction.customId.endsWith(`Enable`))) return;
    const { customId, client,  } = interaction
    const ruletype = customId.split('_')[2]
    interaction.reply(`${ruletype}`)
}