import { ActionRowBuilder, Client, Embed, EmbedBuilder, Interaction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { ConfigInstance } from "../../../../../../Main-Handler/ConfigHandler";
import { AutomodClass } from "../../../../../../classes/moderation/automod";
const automodClass = AutomodClass.getInstance()
export default async (instance: ConfigInstance, interaction: Interaction) => {
    if (!interaction.isStringSelectMenu() || !interaction.customId.startsWith(`${interaction.guildId}Automod_Setup_BannedWords`)) return;
    const customId = interaction.customId
    const client = interaction.client as Client
    switch (customId) {
        case `${interaction.guildId}Automod_Setup_BannedWords_TypeSelectMenu`: {
            const type = interaction.values[0]
            const {embeds, components} = automodClass.utils(interaction).constants.BannedWords.AddWord
            interaction.update({
                embeds: [embeds[0].setTitle(`${type}`)],
                components
            })
        }
            break;
    }
}