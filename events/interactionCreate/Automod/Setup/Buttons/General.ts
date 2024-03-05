import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Interaction,
} from "discord.js";
import { ConfigInstance } from "../../../../../Main-Handler/ConfigHandler";
import {
  AutomodClass,
  automodtype,
} from "../../../../../classes/moderation/automod";
const automodClass = AutomodClass.getInstance();
export default async (_: ConfigInstance, interaction: Interaction) => {
  if (!interaction.isButton()) return;
  if (interaction.customId.startsWith(`${interaction.guildId}Automod_Setup`) && interaction.customId.endsWith(`Enable`)) {
    const { customId, client } = interaction;
    const ruletype = customId.split("_")[2];
    automodClass.enableRuleType(`${interaction.guildId}`, automodtype[ruletype as keyof typeof automodtype]);
    interaction.update({
      embeds: [
        new EmbedBuilder()
          .setColor("Blurple")
          .setTitle(`${ruletype}`)
          .setAuthor({
            name: `${client.user.username}`,
            iconURL: `${client.user.displayAvatarURL()}`,
          })
          .setDescription(
            `<:success:1146683498766291024> Enabled ${ruletype} Automod Rule!`,
          ),
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel("Advanced Settings")
            .setStyle(ButtonStyle.Danger)
            .setCustomId(
              `${interaction.guildId}Automod_Setup_AdvancedSetting_IgnoredChannels`,
            ),
        ),
      ],
    });
  } else if (interaction.customId === `${interaction.guildId}Automod_Setup_Main`) {
    interaction.update(automodClass.utils(interaction).constants.Main);
  };
};
