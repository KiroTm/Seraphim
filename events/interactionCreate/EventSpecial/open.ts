import { Interaction, EmbedBuilder } from "discord.js";
import { ConfigInstance } from "../../../Main-Handler/ConfigHandler";
import { CrateClass } from "../../../classes/EventSpecial/crate";
const crateClass = CrateClass.getInstance()
export default async (instance: ConfigInstance, interaction: Interaction) => {
    if (!interaction.isButton()) return;
    const CustomId = interaction.customId
    const [ amount, crate, userID ] = CustomId.split('-')
    if (!amount.includes('HalloweenCrate')) return;
    await interaction.deferReply({ephemeral: true})
    interaction.message.delete().catch(() => {})
    if (amount == 'HalloweenCrate1') {
        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                .setColor('Grey')
                .setAuthor({name: 'Loading...', iconURL: 'https://media.discordapp.net/attachments/1162785970064740513/1166679422062051428/loadingWeb.gif'})
            ]
        })
    } else if (amount == 'HalloweenCrate10') {
        interaction.editReply("Support for this will be provided in the next Halloween Update. Stay tuned!")
    }
}