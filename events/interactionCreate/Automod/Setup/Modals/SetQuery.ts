import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Embed, EmbedBuilder, Interaction, Message, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { ConfigInstance } from "../../../../../Main-Handler/ConfigHandler";
import { AutomodClass, automodtype } from "../../../../../classes/moderation/automod";
const automodClass = AutomodClass.getInstance();
export default async (_: ConfigInstance, interaction: Interaction) => {
  if (!interaction.isModalSubmit()) return;
  const type: keyof typeof automodtype = interaction.customId.split("_")[2] as 'MassEmoji' | 'MassMention' | 'FastMessage' | 'LinkCooldown'
  if (!type) return;
  switch (interaction.customId) {
    case `${interaction.guildId}Automod_Setup_${type}_Limit_Modal`: {
      const modalField = interaction.fields.getField(`${interaction.guildId}Modal_Limit`).value as string
      let embeds = interaction.message?.embeds as Embed[];
      const query = automodClass.utils(interaction).functions.General[type === 'LinkCooldown' ? 'EvaluateDuration' : 'EvaluateNumber'](modalField);
      if (type === 'LinkCooldown' ? (query === 'INT_LIMIT' || query === 'INVALID_TYPE') : (typeof query !== 'number' || query <= 3)) {
        return interaction.reply({
          content: `${type === 'LinkCooldown' ? query === 'INT_LIMIT' ? "Cooldown should be greater than 30 seconds" : "Cooldown must be a whole number" : query === 'INT_ZERO' ? "Limit cannot be negative" : "Limit must be a whole number greater than 3"}`,
          ephemeral: true
        });
      }
      await interaction.deferUpdate();
      await interaction.editReply({
        message: interaction.message as Message,
        embeds: [...embeds, new EmbedBuilder().setColor('Blue').setTitle(type === 'LinkCooldown' ? "Duration:" : "Limit:").setDescription(`${modalField}`)],
        components: [
          new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
              new ButtonBuilder()
                .setCustomId(`${interaction.guildId}Automod_Setup_${type}_Limit_Confirm`)
                .setStyle(ButtonStyle.Primary)
                .setLabel("Confirm"),

              new ButtonBuilder()
                .setCustomId(`${interaction.guildId}Automod_Setup_${type}_Limit_Cancel`)
                .setStyle(ButtonStyle.Danger)
                .setLabel("Cancel")
            )
        ]
      })
    }
      break;
  }
}
