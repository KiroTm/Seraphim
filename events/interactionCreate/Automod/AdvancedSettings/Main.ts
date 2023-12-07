import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Interaction } from "discord.js";
import { ConfigInstance } from "../../../../Main-Handler/ConfigHandler";
import { AutomodClass } from "../../../../classes/moderation/automod";
const automodClass = AutomodClass.getInstance()
export default async (instance: ConfigInstance, interaction: Interaction) => {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith(`${interaction.guildId}Automod_Setup_AdvancedSetting`)) return;

    switch(interaction.customId) {
        case `${interaction.guildId}Automod_Setup_AdvancedSetting`: {
            interaction.update(automodClass.utils(interaction).constants.AdvancedSettings.Main)
        }
        break;

        case `${interaction.guildId}Automod_Setup_AdvancedSetting_IgnoredChannels`: {
            interaction.update(automodClass.utils(interaction).constants.AdvancedSettings.IgnoredChannels)
        }
    }
} 