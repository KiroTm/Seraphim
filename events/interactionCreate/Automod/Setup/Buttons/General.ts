import { EmbedBuilder, Interaction } from "discord.js";
import { ConfigInstance } from "../../../../../Main-Handler/ConfigHandler";
import { AutomodClass } from "../../../../../classes/moderation/automod";
const automodClass = AutomodClass.getInstance()
export default async (instance: ConfigInstance, interaction: Interaction) => {
    if (!interaction.isButton()) return;
    if ((interaction.customId.startsWith(`${interaction.guildId}Automod_Setup`) && interaction.customId.endsWith(`Enable`))) {
        const { customId, client, } = interaction
        const ruletype = customId.split('_')[2]
        await interaction.update({
            embeds: [
                new EmbedBuilder()
                    .setColor('Blurple')
                    .setAuthor({ name: `${client.user.username}`, iconURL: `${client.user.displayAvatarURL()}` })
                    .setDescription(`<:success:1146683498766291024> Enabled ${ruletype} Automod Rule!`)
            ],
            components: [] 
        })
    } else if (interaction.customId === `${interaction.guildId}Automod_Setup_Main`) {
        interaction.update(automodClass.utils(interaction).constants.Main)
    } else if (interaction.customId.includes(`${interaction.guildId}Automod_Setup`) && interaction.customId.endsWith("Info")) {
        interaction.update({
            embeds: [
                new EmbedBuilder()
                .setAuthor({name: interaction.client.user?.username as string, iconURL: `${interaction.client.user?.displayAvatarURL()}`})
                .setColor('Blue')
            ]
        })
    }
}