import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Embed, EmbedBuilder, Interaction, Message } from "discord.js";
import { ConfigInstance } from "../../../../../Main-Handler/ConfigHandler";
import { AutomodClass } from "../../../../../classes/moderation/automod";
const automodClass = AutomodClass.getInstance()
export default async (instance: ConfigInstance, interaction: Interaction) => {
    if (!interaction.isModalSubmit() || !interaction.customId.startsWith(`${interaction.guildId}Automod_Setup_BannedWords`)) return;
    const customId = interaction.customId
    switch (customId) {
        case `${interaction.guildId}Automod_Setup_BannedWords_AddWord_Modal`: {
            await interaction.deferUpdate()
            const modalField = interaction.fields.getField(`${interaction.guildId}Modal_Word`).value as string
            let embeds = interaction.message?.embeds as Embed[]
            const words = automodClass.utils(interaction).functions.BannedWords.EvaluateWords(modalField)
            await interaction.editReply({
                message: interaction.message as Message,
                embeds: [...embeds, new EmbedBuilder().setColor('Blue').setTitle("Word(s) Evaluated:").setDescription(words.join(",").substring(0, 4000))],
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