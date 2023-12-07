import { Interaction } from "discord.js";
import { ConfigInstance } from "../../../../../../Main-Handler/ConfigHandler";
import { AutomodClass } from "../../../../../../classes/moderation/automod";
const automodClass = AutomodClass.getInstance()
export default async (instance: ConfigInstance, interaction: Interaction) => {
    if (!interaction.isRoleSelectMenu()) return;
    if (!interaction.customId.startsWith(`${interaction.guildId}Automod_Setup_AdvancedSetting`)) return;

    switch (interaction.customId) {
        case `${interaction.guildId}Automod_Setup_AdvancedSetting_IgnoredRole_SelectMenu`: {
            // interaction.update(automodClass.utils(interaction).constants.AdvancedSettings.CustomAction)
        }
    }
}