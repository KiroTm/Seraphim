import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Embed, EmbedBuilder, EmbedData, Interaction, Message, ModalBuilder, SelectMenuComponentOptionData, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { ConfigInstance } from "../../../../../Main-Handler/ConfigHandler";
import { utils } from "../../../../../classes/moderation/Automod/utils";
import ms from "ms";
export default async (instance: ConfigInstance, interaction: Interaction) => {
    if (!interaction.isModalSubmit() || (!interaction.customId.startsWith(`${interaction.guildId}Automod_Manage_RuleType`) && !interaction.customId.endsWith("Modal"))) return;
    const customId = interaction.customId
    const type = customId.split("_")[3]
    if (customId === `${interaction.guildId}Automod_Manage_RuleType_Duration_Modal` || customId === `${interaction.guildId}Automod_Manage_RuleType_Limit_Modal`) {
        const modalField = interaction.fields.getField(`${interaction.guildId}Modal_${type}`).value as string
        let data = interaction.message?.embeds[0].data! as Partial<EmbedData>
        let query = utils(interaction).functions.General[type === 'Duration' ? 'EvaluateDuration' : 'EvaluateNumber'](modalField)
        if (type === 'Duration' && typeof query === 'string' && query !== 'INVALID_TYPE' && (ms(query) < 30000 || ms(query) > 300000)) query = 'INT_LIMIT'
        if (type === 'Duration' ? (query === 'INT_LIMIT' || query === 'INVALID_TYPE') : (typeof query !== 'number' || query <= 1)) {
            return interaction.reply({
                content: `${type === 'Duration' ? query === 'INT_LIMIT' ? "Cooldown should be greater than 30 seconds and less than 5 min" : "Cooldown must be of this type:\nPattern:\`<number>\<min | sec |  hr>`\nExample: \`15mins | 30 sec | 3hr\`" : query === 'INT_ZERO' ? "Limit cannot be negative" : "Limit must be a whole number greater than 1"}`,
                ephemeral: true
            });
        }
        data.fields![0].value = `${query}`
        await interaction.deferUpdate();
        await interaction.editReply({
            message: interaction.message as Message,
            embeds: [new EmbedBuilder(data)],
            components: [
                new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`${interaction.guildId}Automod_Manage_RuleType_${type}_Modal_Confirm`)
                            .setStyle(ButtonStyle.Primary)
                            .setLabel("Confirm"),

                        new ButtonBuilder()
                            .setCustomId(`${interaction.guildId}Automod_Manage_RuleType_${type}_Modal_Cancel`)
                            .setStyle(ButtonStyle.Danger)
                            .setLabel("Cancel")
                    )
            ]
        })


    }
}