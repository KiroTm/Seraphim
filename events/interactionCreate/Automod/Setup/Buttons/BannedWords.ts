import { ActionRowBuilder, Client, EmbedBuilder, Interaction, ModalBuilder, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { ConfigInstance } from "../../../../../Main-Handler/ConfigHandler";
import { AutomodClass, automodtype } from "../../../../../classes/moderation/automod";
const automodClass = AutomodClass.getInstance()
export default async (instance: ConfigInstance, interaction: Interaction) => {
    if (!interaction.isButton()) return;

    const customId = interaction.customId
    
    if (!customId.startsWith(`${interaction.guildId}Automod_Setup_BannedWords`)) return;
    
    switch (customId) {
        case `${interaction.guildId}Automod_Setup_BannedWords_Enable`: {
            await interaction.update(automodClass.utils(interaction).constants.BannedWords.Type)
        }
        break;
        
        case `${interaction.guildId}Automod_Setup_BannedWords_AddWord`: {
            const modal = new ModalBuilder()
            .setTitle("Banned Words")
            .setCustomId(`${interaction.guildId}Automod_Setup_BannedWords_AddWord_Modal`)
            .addComponents(
                new ActionRowBuilder<TextInputBuilder>()
                .addComponents(
                    new TextInputBuilder()
                    .setCustomId(`${interaction.guildId}Modal_Word`)
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder("frick")
                    .setValue("frick")
                    .setRequired(true)
                    .setLabel("Banned Word(s)")
                )
            )
            await interaction.showModal(modal)        
        }
        break;

        case `${interaction.guildId}Automod_Setup_BannedWords_AddWord_Confirm`: {
            const embed = interaction.message.embeds[0]
            const { title, fields } = embed
            const word = automodClass.utils(interaction).functions.BannedWords.EvaluateWords(fields[0].value)
            automodClass.AutomodCollection.set(`${interaction.guildId}`, { type: `${title}`, query: word })
            await interaction.update({
                embeds: [
                    new EmbedBuilder()
                    .setAuthor({name: `${interaction.client.user.username}`, iconURL: `${interaction.client.user.displayAvatarURL()}`})
                    .setColor('Blue')
                    .setDescription(`Added the following words to banned words for type **${title}**:\n${word.join(",")}`)
                ]
            })
        }
        break;

        case `${interaction.guildId}Automod_Setup_BannedWords_AddWord_Cancel`: {
            await interaction.update(automodClass.utils(interaction).constants.BannedWords.AddWord)
        }
        break;
    }
}