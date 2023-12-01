import { EmbedBuilder, Interaction } from "discord.js";
import { ConfigInstance } from "../../../../../Main-Handler/ConfigHandler";

export default async (instance: ConfigInstance, interaction: Interaction) => {
    if (!interaction.isButton()) return;
    if (!(interaction.customId.startsWith(`${interaction.guildId}Automod_Setup`) && interaction.customId.endsWith(`Enable`))) return;
    const { customId, client,  } = interaction
    const ruletype = customId.split('_')[2]
    await interaction.update({
        embeds: [
            new EmbedBuilder()
            .setColor('Blurple')
            .setAuthor({name: `${client.user.username}` ,iconURL: `${client.user.displayAvatarURL()}`})
            .setDescription(`<:success:1146683498766291024> Enabled ${ruletype} Automod Rule!`)
        ],
        components: []
    })
    interaction.reply({
        ephemeral: true,
        content: `${ruletype} should be functional in a minute`
    })
}