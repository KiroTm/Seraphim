import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Embed, EmbedBuilder, Interaction, Message } from "discord.js";
import { ConfigInstance } from "../../../../../Main-Handler/ConfigHandler";
import { AutomodClass } from "../../../../../classes/moderation/automod";
const automodClass = AutomodClass.getInstance();
export default async (_: ConfigInstance, interaction: Interaction) => {
  if (!interaction.isModalSubmit() || !interaction.customId.startsWith(`${interaction.guildId}Automod_Setup_MassMention`)) return;
  const customId = interaction.customId
  switch (customId) {
    case `${interaction.guildId}Automod_Setup_MassMention_Limit_Modal`: {
      const modalField = interaction.fields.getField(`${interaction.guildId}Modal_Limit`).value as string
      let embeds = interaction.message?.embeds as Embed[];
      const limit = automodClass.utils(interaction).functions.General.EvaluateNumber(modalField);
      if (typeof limit !== 'number' || limit <= 3) {
        return interaction.reply({
          content: `${limit === 'INT_ZERO' ? "Limit cannot be negative" : "Limit must be a whole number greater than 3"}`,
          ephemeral: true
        });
      }
      await interaction.deferUpdate();
      await interaction.editReply({
        message: interaction.message as Message,
        embeds: [...embeds, new EmbedBuilder().setColor('Blue').setTitle("Limit:").setDescription(`${modalField}`)],
        components: [
          new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
              new ButtonBuilder()
                .setCustomId(`${interaction.guildId}Automod_Setup_MassMention_Limit_Confirm`)
                .setStyle(ButtonStyle.Primary)
                .setLabel("Confirm"),

              new ButtonBuilder()
                .setCustomId(`${interaction.guildId}Automod_Setup_MassMention_Limit_Cancel`)
                .setStyle(ButtonStyle.Danger)
                .setLabel("Cancel")
            )
        ]
      })
    }
      break;
  }
}
