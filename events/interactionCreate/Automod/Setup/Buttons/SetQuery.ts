import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Interaction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { ConfigInstance } from "../../../../../Main-Handler/ConfigHandler";
import { AutomodClass, automodtype } from "../../../../../classes/moderation/automod";
import ms from "ms";
const automodClass = AutomodClass.getInstance();
export default async (_: ConfigInstance, interaction: Interaction) => {
  if (!interaction.isButton()) return;
  const type: keyof typeof automodtype = interaction.customId.split("_")[2] as 'MassEmoji' | 'MassMention' | 'FastMessage' | 'LinkCooldown'
  if (!type) return;
  switch (interaction.customId) {
    case `${interaction.guildId}Automod_Setup_${type}_Limit_Setup`: {
      const modal = new ModalBuilder()
        .setTitle(type === 'LinkCooldown' ? "Duration" : "Limit")
        .setCustomId(`${interaction.guildId}Automod_Setup_${type}_Limit_Modal`)
        .addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId(`${interaction.guildId}Modal_Limit`)
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
              .setMaxLength(type === 'LinkCooldown' ? 10 : 1)
              .setLabel("Set Limit"),
          ),
        );
      interaction.showModal(modal)
    }
      break;

    case `${interaction.guildId}Automod_Setup_${type}_Limit_Cancel`: {
      const constants = automodClass.utils(interaction).constants
      interaction.update(constants[type]?.Main)
    }
      break;

    case `${interaction.guildId}Automod_Setup_${type}_Limit_Confirm`: {
      const [_, info] = interaction.message.embeds;
      const limit = info.description as string
      await interaction.update({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: `${interaction.client.user.username}`,
              iconURL: `${interaction.client.user.displayAvatarURL()}`,
            })
            .setColor("Blue")
            .setDescription(`Successfully setup ${type}. You can enable it anytime!`),

          new EmbedBuilder()
            .setColor("Blue")
            .setTitle("MassMention")
            .setDescription(
              `Select "Enable" to enable the current rule and "Maybe Not" to keep it disabled. This rule won't take effect until it's enabled, you can enable this rule anytime using automod manage command. For more info kindly run the automod info command.`,
            ),
        ],
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setLabel("Enable Anti Mass Mention")
              .setStyle(ButtonStyle.Primary)
              .setCustomId(
                `${interaction.guildId}Automod_Setup_${type}_Enable`,
              ),

            new ButtonBuilder()
              .setLabel("Maybe later")
              .setStyle(ButtonStyle.Secondary)
              .setCustomId(
                `${interaction.guildId}Automod_Setup_${type}_EnableNot`,
              ),
          ),
        ],
      });
      automodClass.addOrUpdateRuleType(interaction.guildId as string, {
        type: automodtype[type],
        enabled: false,
        config: [
          {
            Query: type === 'LinkCooldown' ? ms(limit) : parseInt(limit)
          },
        ],
      })
    }
      break;
  }
}
