import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Embed, EmbedBuilder, Interaction, Message } from "discord.js";
import { ConfigInstance } from "../../../../../../NeoHandler/ConfigHandler";
import { utils } from "../../../../../Classes/moderation/Automod/utils";
import ms from "ms";
export default async (_: ConfigInstance, interaction: Interaction) => {
  if (!interaction.isModalSubmit() || !interaction.customId.startsWith(`${interaction.guildId}Automod_Setup_AdvancedSetting`)) return;
  const customId = interaction.customId;
  if (customId === `${interaction.guildId}Automod_Setup_AdvancedSetting_Threshold_Duration_Modal`) {
    const modalField = interaction.fields.getField(`${interaction.guildId}Modal_Duration`).value as string;
    const embeds: EmbedBuilder[] = [];
    let [main, info] = interaction.message?.embeds as Embed[] | EmbedBuilder[];
    info = utils(interaction).functions.General.RemoveField(undefined, info as Embed, "Duration")[0]
    let duration = utils(interaction).functions.General.EvaluateDuration(modalField);
    if (ms(duration) < 60000 || ms(duration) > 31557600000) duration = 'INT_LIMIT'
    if (duration === 'INVALID_TYPE' || duration === 'INT_LIMIT') {
      return interaction.reply({
        content: `${duration === 'INT_LIMIT' ? "Duration should be greater than 1 minute and less than a year" : "Duration must be a whole number"}`,
        ephemeral: true
      });
    }
    await interaction.deferUpdate();
    embeds.push(
      new EmbedBuilder(main.data),
      info ?
        new EmbedBuilder(info.data).addFields({ name: "Duration", value: `${duration}` }) :
        new EmbedBuilder().setColor('Blue').setTitle('Info').setFields({ name: "Duration", value: `${duration}` })
    );

    interaction.editReply({
      message: interaction.message as Message,
      embeds,
      components: [
        new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(`${interaction.guildId}Automod_Setup_AdvancedSetting_Threshold_Duration_Confirm`)
              .setStyle(ButtonStyle.Primary)
              .setLabel("Confirm"),

            new ButtonBuilder()
              .setCustomId(`${interaction.guildId}Automod_Setup_AdvancedSetting_CustomAction_Confirm`)
              .setStyle(ButtonStyle.Danger)
              .setLabel("Cancel")
          )
      ]
    });
  }
};
