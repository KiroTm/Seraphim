import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Interaction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { ConfigInstance } from "../../../../../../Old-Handler/ConfigHandler";
import { AutomodClass, automodtype } from "../../../../../Classes/moderation/Automod/automod";
import { utils } from "../../../../../Classes/moderation/Automod/utils";
const automodClass = AutomodClass.getInstance();
export default async (_: ConfigInstance, interaction: Interaction) => {
  if (!interaction.isButton()) return;
  const customId = interaction.customId
  if (interaction.customId.startsWith(`${interaction.guildId}Automod_Setup`) && interaction.customId.endsWith(`Enable`)) {
    const { customId, client } = interaction;
    const ruletype = customId.split("_")[2];
    automodClass.enableorDisableRuleType(`${interaction.guildId}`, automodtype[ruletype as keyof typeof automodtype]);
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
  } else if (customId.startsWith(`${interaction.guildId}Automod_Setup_BannedWords`)) {
    switch (customId) {
      case `${interaction.guildId}Automod_Setup_BannedWords_Main`:
        {
          await interaction.update(
            utils(interaction).constants.BannedWords.Main,
          );
        }
        break;

      case `${interaction.guildId}Automod_Setup_BannedWords_AddWord`:
        {
          const modal = new ModalBuilder()
            .setTitle("Banned Words")
            .setCustomId(
              `${interaction.guildId}Automod_Setup_BannedWords_AddWord_Modal`,
            )
            .addComponents(
              new ActionRowBuilder<TextInputBuilder>().addComponents(
                new TextInputBuilder()
                  .setCustomId(`${interaction.guildId}Modal_Word`)
                  .setStyle(TextInputStyle.Paragraph)
                  .setPlaceholder("frick")
                  .setRequired(true)
                  .setMaxLength(4000)
                  .setLabel("Banned Word(s)"),
              ),
            );
          await interaction.showModal(modal);
        }
        break;

      case `${interaction.guildId}Automod_Setup_BannedWords_AddWord_Confirm`:
        {
          const [embed1, embed2] = interaction.message.embeds;
          const title = embed1.title as string;
          const fields = embed2.description as string;
          const word = utils(interaction).functions.BannedWords.EvaluateWords(fields);
          await interaction.update({
            embeds: [
              new EmbedBuilder()
                .setAuthor({
                  name: `${interaction.client.user.username}`,
                  iconURL: `${interaction.client.user.displayAvatarURL()}`,
                })
                .setColor("Blue")
                .setDescription(
                  `Added the following words to banned words for type **${title}**:\n${word.join(",")}`,
                ),

              new EmbedBuilder()
                .setColor("Blue")
                .setTitle("BannedWords")
                .setDescription(
                  `Select "Enable" to enable the current rule and "Maybe Not" to keep it disabled. This rule won't take effect until it's enabled, you can enable this rule anytime using automod manage command. For more info kindly run the automod info command.`,
                ),
            ],
            components: [
              new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                  .setLabel("Enable Banned Words")
                  .setStyle(ButtonStyle.Primary)
                  .setCustomId(
                    `${interaction.guildId}Automod_Setup_BannedWords_AddWord_Enable`,
                  ),

                new ButtonBuilder()
                  .setLabel("Maybe later")
                  .setStyle(ButtonStyle.Secondary)
                  .setCustomId(
                    `${interaction.guildId}Automod_Setup_BannedWords_AddWord_EnableNot`,
                  ),
              ),
            ],
          });
          automodClass.addOrUpdateRuleType(interaction.guildId as string, {
            type: automodtype.BannedWords,
            enabled: false,
            config: [
              {
                words: word,
                filterType: title,
              },
            ],
          });
        }
        break;

      case `${interaction.guildId}Automod_Setup_BannedWords_AddWord_Cancel`:
        {
          await interaction.update(
            utils(interaction).constants.BannedWords.AddWord,
          );
        }
        break;

      case `${interaction.guildId}Automod_Setup_BannedWords_AddWord_EnableNot`: {
        await interaction.update({
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: `${interaction.client.user.username}`,
                iconURL: `${interaction.client.user.displayAvatarURL()}`,
              })
              .setColor("Blue")
              .setDescription(
                "Sure thing! Your input has been saved and can be retrieved at any time. Keep in mind, though, this rule won't take effect until it's activated. Feel free to enable it whenever you're ready!",
              ),
          ],
          components: [],
        });
      }
    }
  } else if (interaction.customId === `${interaction.guildId}Automod_Setup_Main`) {
    interaction.update(utils(interaction).constants.Main);
  }
};
