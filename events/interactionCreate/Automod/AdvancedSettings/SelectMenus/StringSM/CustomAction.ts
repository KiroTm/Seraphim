import { Embed, EmbedBuilder, Interaction } from "discord.js";
import { ConfigInstance } from "../../../../../../Main-Handler/ConfigHandler";

export default (instance: ConfigInstance, interaction: Interaction) => {
    if (!interaction.isStringSelectMenu() || interaction.customId !== `${interaction.guildId}Automod_Setup_CustomAction_SelectMenu`) return;
    const selected = interaction.values[0]
    let embeds: EmbedBuilder[] = []
    const [main, info] = interaction.message.embeds
    embeds.push(new EmbedBuilder(main.data).setFields({name: "Action Selected", value: `**${selected}**`}))
    info ? embeds.push(new EmbedBuilder(info.data)) : null
    interaction.update({
        embeds, 
        components: [
            
        ]
    })
}