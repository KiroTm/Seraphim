import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Embed, EmbedBuilder, Interaction, Message } from "discord.js";
import { ConfigInstance } from "../../../../../Main-Handler/ConfigHandler";
import { utils } from "../../../../../classes/moderation/Automod/utils";

export default async (_: ConfigInstance, interaction: Interaction) => {
  if (!interaction.isModalSubmit() || !interaction.customId.startsWith(`${interaction.guildId}Automod_Setup_AdvancedSetting`)) return;
  const customId = interaction.customId;
  if (customId === `${interaction.guildId}Automod_Setup_AdvancedSetting_Threshold_Modal`) {
    const modalField = interaction.fields.getField(`${interaction.guildId}Modal_Threshold`).value as string;
    const embeds: EmbedBuilder[] = [];
    let [main, info] = interaction.message?.embeds as Embed[];
    const threshold = utils(interaction).functions.General.EvaluateNumber(modalField);
    if (typeof threshold !== 'number') {
      return interaction.reply({
        content: `${threshold === 'INT_ZERO' ? "Threshold cannot be negative" : "Threshold must be a whole number"}`,
        ephemeral: true
      });
    }
    await interaction.deferUpdate();
    embeds.push(
      new EmbedBuilder(main.data),
      info ?
        new EmbedBuilder(info.data).addFields({ name: "Threshold", value: `${threshold}` }) :
        new EmbedBuilder().setColor('Blue').setTitle('Info').setFields({ name: "Threshold", value: `${threshold}` })
    );

    interaction.editReply({
      message: interaction.message as Message,
      embeds,
      components: [
        new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(`${interaction.guildId}Automod_Setup_AdvancedSetting_Threshold_Confirm`)
              .setStyle(ButtonStyle.Primary)
              .setLabel("Confirm"),

            new ButtonBuilder()
              .setCustomId(`${interaction.guildId}Automod_Setup_AdvancedSetting_Threshold_Cancel`)
              .setStyle(ButtonStyle.Danger)
              .setLabel("Cancel")
          )
      ]
    });
  }
};
