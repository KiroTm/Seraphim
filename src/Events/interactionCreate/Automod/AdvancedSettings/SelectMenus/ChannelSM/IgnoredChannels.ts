import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Embed, EmbedBuilder, Interaction } from "discord.js";
import { ConfigInstance } from "../../../../../../../Old-Handler/ConfigHandler";
export default async (instance: ConfigInstance, interaction: Interaction) => {
    if (!interaction.isChannelSelectMenu()) return;
    if (!interaction.customId.startsWith(`${interaction.guildId}Automod_Setup_AdvancedSetting`)) return;

    switch (interaction.customId) {
        case `${interaction.guildId}Automod_Setup_AdvancedSetting_IgnoredChannels_SelectMenu`: {
            interaction.update({
                embeds: [
                    ...interaction.message.embeds,
                    new EmbedBuilder()
                    .setColor('Blue')
                    .setTitle("Info:")
                    .setFields({name: "Channel", value: `${interaction.channels.map((c) => c).join(",")}`})
                ],  
                components: [
                    new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                        .setLabel("Confirm")
                        .setStyle(ButtonStyle.Primary)
                        .setCustomId(`${interaction.guildId}Automod_Setup_AdvancedSetting_IgnoredChannels_Confirm`),

                        new ButtonBuilder()
                        .setLabel("Cancel")
                        .setStyle(ButtonStyle.Danger)
                        .setCustomId(`${interaction.guildId}Automod_Setup_AdvancedSetting_IgnoredChannels_Cancel`)
                    )
                ]
            })
        }
    }
}