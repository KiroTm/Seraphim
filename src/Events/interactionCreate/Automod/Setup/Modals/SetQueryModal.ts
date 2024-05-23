import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Embed, EmbedBuilder, Interaction, Message, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { ConfigInstance } from "../../../../../../Old-Handler/ConfigHandler";
import { automodtype } from "../../../../../Classes/moderation/Automod/automod";
import { utils } from "../../../../../Classes/moderation/Automod/utils";
import ms from "ms";
export default async (_: ConfigInstance, interaction: Interaction) => {
  if (!interaction.isModalSubmit()) return;
  const type: keyof typeof automodtype = interaction.customId.split("_")[2] as 'MassEmoji' | 'MassMention' | 'FastMessage' | 'LinkCooldown' | 'BannedWords'
  if (!type) return;
  switch (interaction.customId) {
    case `${interaction.guildId}Automod_Setup_${type}_${type === 'BannedWords' ? 'AddWord' : 'Limit'}_Modal`: {
      const modalField = interaction.fields.getField(`${interaction.guildId}Modal_${type === 'BannedWords' ? "Word" : "Limit"}`).value as string
      let embeds = interaction.message?.embeds as Embed[];
      //@ts-ignore
      let query = utils(interaction).functions[type === 'BannedWords' ? 'BannedWords' : 'General'][type === 'LinkCooldown' ? 'EvaluateDuration' : type === 'BannedWords' ? 'EvaluateWords' : 'EvaluateNumber'](modalField);
      if (type === 'LinkCooldown' && typeof query === 'string' && query !== 'INVALID_TYPE' && (ms(query) < 30000 || ms(query) > 300000)) query = 'INT_LIMIT'
      if (!Array.isArray(query) && (type === 'LinkCooldown' ? (query === 'INT_LIMIT' || query === 'INVALID_TYPE') : (typeof query !== 'number' || query <= 1))) {
        return interaction.reply({
          content: `${type === 'LinkCooldown' ? query === 'INT_LIMIT' ? "Cooldown should be greater than 30 seconds and less than 5 min" : "Cooldown must be of this type:\nPattern:\`<number>\<min | sec |  hr>`\nExample: \`15mins | 30 sec | 3hr\`" : query === 'INT_ZERO' ? "Limit cannot be negative" : "Limit must be a whole number greater than 1"}`,
          ephemeral: true
        });
      }
      await interaction.deferUpdate();
      await interaction.editReply({
        message: interaction.message as Message,
        embeds: [...embeds, new EmbedBuilder().setColor('Blue').setTitle(type === 'LinkCooldown' ? "Duration:" : type === 'BannedWords' ? "Word(s) Evaluated:" : "Limit:").setDescription(type === 'BannedWords' && Array.isArray(query) ? `${query.join(",").substring(0, 4000)}` : `${modalField}`)],
        components: [
          new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
              new ButtonBuilder()
                .setCustomId(`${interaction.guildId}Automod_Setup_${type}_${type === 'BannedWords' ? "AddWord" : "Limit"}_Confirm`)
                .setStyle(ButtonStyle.Primary)
                .setLabel("Confirm"),

              new ButtonBuilder()
                .setCustomId(`${interaction.guildId}Automod_Setup_${type}_${type === 'BannedWords' ? "AddWord" : "Limit"}_Cancel`)
                .setStyle(ButtonStyle.Danger)
                .setLabel("Cancel")
            )
        ]
      })
    }
    break;
  }
}
