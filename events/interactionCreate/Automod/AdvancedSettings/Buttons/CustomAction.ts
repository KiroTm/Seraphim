import { ActionRowBuilder, Embed, EmbedBuilder, Interaction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { ConfigInstance } from "../../../../../Main-Handler/ConfigHandler";
import { AutomodClass } from "../../../../../classes/moderation/automod";

const automodClass = AutomodClass.getInstance();

export default async (instance: ConfigInstance, interaction: Interaction) => {
  if (!interaction.isButton() || !interaction.customId.startsWith(`${interaction.guildId}Automod_Setup_AdvancedSetting`)) return;

  const customId = interaction.customId;
  if (customId === `${interaction.guildId}Automod_Setup_AdvancedSetting_IgnoredRoles_Confirm` || customId === `${interaction.guildId}Automod_Setup_AdvancedSetting_CustomAction`) {
    const { embeds, components } = automodClass.utils(interaction).constants.AdvancedSettings.CustomAction;
    const [_, info] = interaction.message.embeds as Embed[];

    if (info) embeds.push(new EmbedBuilder(info.data));

    interaction.update({ embeds, components });
  } else if (customId === `${interaction.guildId}Automod_Setup_AdvancedSetting_Threshold_Duration_Confirm` || customId === `${interaction.guildId}Automod_Setup_AdvancedSetting_Threshold` || customId === `${interaction.guildId}Automod_Setup_AdvancedSetting_CustomAction_Confirm`) {
    if (customId === `${interaction.guildId}Automod_Setup_AdvancedSetting_CustomAction_Confirm` && interaction?.message?.embeds[1]?.fields.find((f) => f?.name === "Action")?.value == 'Mute' || interaction?.message?.embeds[1]?.fields.find((f) => f?.name === "Action")?.value == 'Ban') {
      const modal = new ModalBuilder()
        .setTitle("Duration")
        .setCustomId(`${interaction.guildId}Automod_Setup_AdvancedSetting_Threshold_Duration_Modal`)
        .addComponents(
          new ActionRowBuilder<TextInputBuilder>()
            .addComponents(
              new TextInputBuilder()
                .setCustomId(`${interaction.guildId}Modal_Duration`)
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMaxLength(9)
                .setLabel("Duration")
                .setPlaceholder("Specify duration, set -1 for action to be permanent.")
            )
        );
      return interaction.showModal(modal);
    }
    const { embeds, components } = automodClass.utils(interaction).constants.AdvancedSettings.Threshold
    if (interaction.message.embeds && interaction.message.embeds[1]) embeds.push(new EmbedBuilder(interaction.message.embeds[1].data))
    interaction.update({ embeds, components })
  }
}
