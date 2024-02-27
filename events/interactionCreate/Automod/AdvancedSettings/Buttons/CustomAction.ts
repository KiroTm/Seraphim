import { Embed, EmbedBuilder, Interaction } from "discord.js";
import { ConfigInstance } from "../../../../../Main-Handler/ConfigHandler";
import { AutomodClass } from "../../../../../classes/moderation/automod";

const automodClass = AutomodClass.getInstance();

export default async (instance: ConfigInstance, interaction: Interaction) => {
    if (!interaction.isButton() || !interaction.customId.startsWith(`${interaction.guildId}Automod_Setup_AdvancedSetting`)) return;

    const customId = interaction.customId;
    if (customId === `${interaction.guildId}Automod_Setup_AdvancedSetting_IgnoredRoles_Confirm` || customId === `${interaction.guildId}Automod_Setup_AdvancedSetting_CustomAction`) {
        const { embeds, components } = automodClass.utils(interaction).constants.AdvancedSettings.CustomAction;
        const [_, info] = interaction.message.embeds as Embed[];

        if (info) embeds.push(new EmbedBuilder(info.data));

        interaction.update({ embeds, components });
    }
}
