import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Embed, EmbedBuilder, Interaction } from "discord.js";
import { ConfigInstance } from "../../../../../../../NeoHandler/ConfigHandler";
export default async (instance: ConfigInstance, interaction: Interaction) => {
    if (!interaction.isRoleSelectMenu()) return;
    if (!interaction.customId.startsWith(`${interaction.guildId}Automod_Setup_AdvancedSetting`)) return;

    switch (interaction.customId) {
        case `${interaction.guildId}Automod_Setup_AdvancedSetting_IgnoredRole_SelectMenu`: {
            const [, infoEmbed] = interaction.message.embeds;
            const field = {name: "Role", value: `${interaction.roles.map((r) => r).join(",")}`}
            let updatedEmbed: EmbedBuilder;
            infoEmbed?.title === 'Info:' ? updatedEmbed = new EmbedBuilder(infoEmbed.data).addFields(field)
                : updatedEmbed = new EmbedBuilder().setColor('Blue').setTitle('Info:').setFields(field)
        
            interaction.update({
                embeds: [interaction.message.embeds[0], updatedEmbed],
                components: [
                    new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                        .setLabel("Confirm")
                        .setStyle(ButtonStyle.Primary)
                        .setCustomId(`${interaction.guildId}Automod_Setup_AdvancedSetting_IgnoredRoles_Confirm`),

                        new ButtonBuilder()
                        .setLabel("Cancel")
                        .setStyle(ButtonStyle.Danger)
                        .setCustomId(`${interaction.guildId}Automod_Setup_AdvancedSetting_IgnoredRoles_Cancel`)
                    )
                ]
            });
            break;
        }        
        
    }
}