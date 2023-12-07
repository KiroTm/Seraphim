import { Embed, EmbedBuilder, Interaction } from "discord.js";
import { ConfigInstance } from "../../../../../Main-Handler/ConfigHandler";
import { AutomodClass } from "../../../../../classes/moderation/automod";
const automodClass = AutomodClass.getInstance()
export default async (intance: ConfigInstance, interaction: Interaction) => {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith(`${interaction.guildId}Automod_Setup_AdvancedSetting`)) return;
    switch (interaction.customId) {
        case `${interaction.guildId}Automod_Setup_AdvancedSetting_IgnoredChannels_Confirm` || `${interaction.guildId}Automod_Setup_AdvancedSetting_IgnoredRoles` : {
            const object = automodClass.utils(interaction).constants.AdvancedSettings.IgnoredRoles
            const embeds = object.embeds as any[]
            if (interaction.isButton() && interaction?.message?.embeds[1]?.title === "Info:") embeds.push(interaction.message.embeds[1])
            interaction.update({
                embeds: embeds,
                components: object.components
            })
        }
        break;

        case `${interaction.guildId}Automod_Setup_AdvancedSetting_IgnoredChannels_Cancel`: {
            interaction.update(automodClass.utils(interaction).constants.AdvancedSettings.IgnoredChannels)
        }
        break;
    }
}