import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, EmbedBuilder, Interaction, StringSelectMenuBuilder } from "discord.js";
import { ConfigInstance } from "../../../../../../Main-Handler/ConfigHandler";
import { AutomodClass } from "../../../../../../classes/moderation/automod";
const automodClass = AutomodClass.getInstance()
export default async (instance: ConfigInstance, interaction: Interaction) => {

    if (!interaction.isStringSelectMenu()) return;
    const customId = interaction.customId

    if (!customId.startsWith(`${interaction.guildId}Automod_Setup`)) return;

    switch (customId) {

        case `${interaction.guildId}Automod_Setup_RuleType_SelectMenu`: {

            switch (interaction.values[0]) {
                case "bannedwords": {
                    await interaction.update(automodClass.utils(interaction).constants.BannedWords.Main)
                }
                    break;

                case "phishinglinks": {
                    await interaction.update(automodClass.utils(interaction).constants.PhishingLinks.Main)
                }
                    break;

                case "massmention": {
                    await interaction.update(automodClass.utils(interaction).constants.PhishingLinks.Main)
                }
                    break;

                case "serverinvites": {
                    await interaction.update(automodClass.utils(interaction).constants.ServerLinks.Main)
                }
                    break;

            }
        }
            break;
    }

}