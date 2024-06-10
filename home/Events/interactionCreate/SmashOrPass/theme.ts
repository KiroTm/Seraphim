import { Interaction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'
import { ConfigInstance } from "../../../../NeoHandler/ConfigHandler";
import { SmashOrPassThemesMap } from '../../../Classes/Misc/smashorpass';
export default async (instance: ConfigInstance, interaction: Interaction) => {
    if (!interaction.isStringSelectMenu() || interaction.customId !== "SmashOrPassDropdown") return;
    const themes = interaction.values;
    const { message: { embeds } } = interaction
    const themeMap = themes.map((theme) => SmashOrPassThemesMap.find(({value}) => value === theme).label)
    await interaction.update({
        embeds: [
            new EmbedBuilder(embeds[0]).setFooter({text: `Theme(s): ${themeMap.join(" | ")}`})
        ],
        components: [
            new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                .setCustomId("SmashOrPassBegin")
                .setLabel("Start")
                .setStyle(ButtonStyle.Primary)
            )
        ]
    })
}