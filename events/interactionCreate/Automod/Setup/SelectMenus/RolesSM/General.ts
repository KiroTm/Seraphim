import { Embed, EmbedBuilder, Interaction } from "discord.js";
import { ConfigInstance } from "../../../../../../Main-Handler/ConfigHandler";
import { client } from "../../../../../..";

export default async (instance: ConfigInstance, interaction: Interaction) => {
    if (!interaction.isRoleSelectMenu()) return;
    // if (interaction.customId.includes(`${interaction.guildId}Automod_Setup`) && interaction.customId.endsWith("Info")) {
    //     interaction.update({
    //         embeds: [
    //             new EmbedBuilder()
    //             .setAuthor({name: client.user?.username as string, iconURL: `${client.user?.displayAvatarURL()}`})
    //             .setColor('Blue')
    //         ]
    //     })
    // }
}