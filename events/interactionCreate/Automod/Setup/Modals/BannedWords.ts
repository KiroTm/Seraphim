import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Interaction, Message } from "discord.js";
import { ConfigInstance } from "../../../../../Main-Handler/ConfigHandler";
import { AutomodClass } from "../../../../../classes/moderation/automod";
const automodClass = AutomodClass.getInstance()
export default async (instance: ConfigInstance, interaction: Interaction) => {
    if (!interaction.isModalSubmit() || !interaction.customId.startsWith(`${interaction.guildId}Automod_Setup_BannedWords`)) return;
    const customId = interaction.customId
    const client = interaction.client

    switch (customId) {
        case `${interaction.guildId}Automod_Setup_BannedWords_AddWord_Modal`: {
            await interaction.deferUpdate()
            const modalField = interaction.fields.getField(`${interaction.guildId}Modal_Word`).value as string
            let embed = new EmbedBuilder(interaction.message?.embeds[0].data)
            const words = automodClass.utils(interaction).functions.BannedWords.EvaluateWords(modalField)
            await interaction.editReply({
                message: interaction.message as Message,
                embeds: [embed.setFields({name: `Words Evaluated:`, value: `${words.join(", ")}`})],
                components: [
                    new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId(`${interaction.guildId}Automod_Setup_BannedWords_AddWord_Confirm`)
                        .setStyle(ButtonStyle.Primary)
                        .setLabel("Confirm"),

                        new ButtonBuilder()
                        .setCustomId(`${interaction.guildId}Automod_Setup_BannedWords_AddWord_Cancel`)
                        .setStyle(ButtonStyle.Danger)
                        .setLabel("Cancel")
                    )
                ]
            })
        }
        break;
    }
}