import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, Interaction } from "discord.js";
import { ConfigInstance } from "../../../../../../Main-Handler/ConfigHandler";

export default (instance: ConfigInstance, interaction: Interaction) => {
    if (!interaction.isStringSelectMenu() || interaction.customId !== `${interaction.guildId}Automod_Setup_AdvancedSetting_CustomAction_SelectMenu`) return;

    const [main, info] = interaction.message.embeds;
    const selected = interaction.values[0];
    const fields = info ? info.fields : [];
    fields.push({ name: "Action", value: selected });

    const embeds = [
        new EmbedBuilder(main?.data),
        new EmbedBuilder({ color: Colors.Blue, title: "Info:", fields })
    ];

    interaction.update({
        embeds,
        components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder().setLabel("Confirm").setStyle(ButtonStyle.Primary).setCustomId(`${interaction.guildId}Automod_Setup_AdvancedSetting_CustomAction_Confirm`),
                new ButtonBuilder().setLabel("Cancel").setStyle(ButtonStyle.Danger).setCustomId(`${interaction.guildId}Automod_Setup_AdvancedSetting_CustomAction_Cancel`)
            )
        ]
    });
}
