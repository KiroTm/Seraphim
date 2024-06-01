import { APISelectMenuOption, ActionRowBuilder, ButtonBuilder, ButtonStyle, Embed, EmbedBuilder, Interaction, ModalBuilder, SelectMenuComponentOptionData, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { ConfigInstance } from "../../../../../../NeoHandler/ConfigHandler";
import { utils } from "../../../../../Classes/moderation/Automod/utils";
import { AutomodClass, RuleConfig, automodtype } from "../../../../../Classes/moderation/Automod/automod";
import ms from "ms";
const automodClass = AutomodClass.getInstance()
export default async (_: ConfigInstance, interaction: Interaction) => {
  if (!interaction.isButton() || !interaction.customId.startsWith(`${interaction.guildId}Automod_Manage`)) return;
  const customId = interaction.customId
  const type = customId.split("_")[3]
  const ruletype = automodtype[interaction?.message?.embeds[0]?.title as keyof typeof automodtype]
  const config = automodClass.AutomodCollection.get(interaction.guildId!)?.rules?.get(ruletype as automodtype)
  if (customId === `${interaction.guildId}Automod_Manage_Main`) {
    const config = automodClass.AutomodCollection.get(interaction.guildId!)?.rules
    interaction.update({
      embeds: [
        new EmbedBuilder()
          .setColor("Blue")
          .setAuthor({
            name: `${interaction.client.user.username}`,
            iconURL: `${interaction.client.user.displayAvatarURL()}`,
          })
          .setDescription(`Choose the rule you wish to manage, and you'll be guided through the process. After selecting the rule type, you'll be prompted to choose an action.`)
      ],
      components: [
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          new StringSelectMenuBuilder()
            .setPlaceholder("Select automod rule type")
            .setCustomId(
              `${interaction.guildId}Automod_Manage_RuleType`,
            )
            .addOptions(utils(interaction).functions.Manage.constructRuleType(config)),
        ),
      ],
      files: []
    })
  } else if (customId === `${interaction.guildId}Automod_Manage_RuleType_Duration` || customId === `${interaction.guildId}Automod_Manage_RuleType_Limit`) {
    const modal = new ModalBuilder()
      .setTitle(type === 'LinkCooldown' ? "Duration" : "Limit")
      .setCustomId(`${interaction.guildId}Automod_Manage_RuleType_${type}_Modal`)
      .addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId(`${interaction.guildId}Modal_${type}`)
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(type === 'Duration' ? 10 : 1)
            .setLabel("Set Limit"),
        ),
      );
    interaction.showModal(modal)
  } else if (customId === `${interaction.guildId}Automod_Manage_RuleType_${type}_Modal_Confirm`) {
    automodClass.updateQueryField(interaction.guildId!, (config?.type ?? ruletype) as automodtype, ms(interaction.message.embeds[0].data.fields![0].value!))
    interaction.update({
      embeds: [
        new EmbedBuilder()
          .setColor("Blurple")
          .setTitle(`${ruletype}`)
          .setAuthor({
            name: `${interaction.client.user.username}`,
            iconURL: `${interaction.client.user.displayAvatarURL()}`,
          })
          .setDescription(
            `<:success:1146683498766291024> Updated ${ruletype} Automod Rule!`,
          ),
      ],
      components: [],
    })
  } else if (customId === `${interaction.guildId}Automod_Manage_RuleType_${type}_Modal_Cancel`) {
    const val = config?.config?.[0].Query
    interaction.update({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `${interaction.client.user?.username}`,
            iconURL: `${interaction.client.user?.displayAvatarURL()}`,
          })
          .setColor("Blue")
          .setTitle(interaction.message.embeds[0].title)
          .setDescription(`Update or set a new ${type} to your rule!`)
          .setFields({ name: `Current ${type}:`, value: `${val ? type === 'duration' ? `${ms(val), { long: true }}` : `${val}` : "None"}` })
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId(
              `${interaction.guildId}Automod_Manage_RuleType_${type}`,
            )
            .setStyle(ButtonStyle.Primary)
            .setLabel(`Edit ${type}`),
        ),
      ],
    })
  } else if (customId === `${interaction.guildId}Automod_Manage_RuleType_Words_UpdateWords`) {
    const modal = new ModalBuilder()
      .setTitle("Words")
      .setCustomId(`${interaction.guildId}Automod_Manage_RuleType_Words_UpdateWords_Modal`)
      .addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId(`${interaction.guildId}Modal_Words`)
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(4000)
            .setLabel("Set Words"),
        ),
      );
    interaction.showModal(modal)
  } else if (customId === `${interaction.guildId}Automod_Manage_RuleType_Words_UpdateWords_Confirm`) {
    interaction.update({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `${interaction.client.user?.username}`,
            iconURL: `${interaction.client.user?.displayAvatarURL()}`,
          })
          .setColor("Blue")
          .setTitle(interaction.message.embeds[0].title)
          .setDescription("Would you like to replace the previous set of words with the new ones, or would you prefer to add to them?"),
          interaction.message.embeds[1]
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            new ButtonBuilder()
              .setLabel("Replace")
              .setStyle(ButtonStyle.Primary)
              .setCustomId(`${interaction.guildId}Automod_Manage_RuleType_Words_UpdateWords_Replace`),

            new ButtonBuilder()
              .setLabel("Add")
              .setStyle(ButtonStyle.Primary)
              .setCustomId(`${interaction.guildId}Automod_Manage_RuleType_Words_UpdateWords_Add`)
          )
      ]
    })
  } else if (customId === `${interaction.guildId}Automod_Manage_RuleType_Words_UpdateWords_Cancel`) {
    const config = automodClass.AutomodCollection.get(interaction.guildId!)?.rules.get(automodtype.BannedWords as automodtype)?.config
    if (!config || !config.length) return interaction.update({
      embeds: [
        new EmbedBuilder()
          .setColor('Red')
          .setDescription("You are yet to setup banned words. Please configure banned words to effectively manage them.")
      ],
      components: []
    })
    const options = config.map((filter: RuleConfig) => {
      const { filterType } = filter;
      return {
        label: filterType?.charAt(0).toUpperCase()! + filterType?.substring(1),
        value: filterType,
      };
    }) as APISelectMenuOption[];

    interaction.update({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `${interaction.client.user?.username}`,
            iconURL: `${interaction.client.user?.displayAvatarURL()}`,
          })
          .setColor("Blue")
          .setTitle("BannedWords")
          .setDescription(`Select the filter you wish to modify. You have the option to either add new words or replace the entire existing set of words`)
      ],
      components: [
        new ActionRowBuilder<StringSelectMenuBuilder>()
          .addComponents(
            new StringSelectMenuBuilder()
              .setCustomId(`${interaction.guildId}Automod_Manage_RuleType_Words`)
              .setPlaceholder("Select Filter")
              .setMaxValues(1)
              .setMinValues(1)
              .setOptions(options)
          )
      ]
    });
  } else if (customId === `${interaction.guildId}Automod_Manage_RuleType_Words_UpdateWords_Replace`) {

  } else if (customId === `${interaction.guildId}Automod_Manage_RuleType_Words_UpdateWords_Add`) {
    const embeds = interaction.message.embeds as Embed[]
    const filter = embeds[0].title!
    const words = utils(interaction).functions.BannedWords.EvaluateWords((embeds[0].description as string))
      automodClass.addOrUpdateRuleType(interaction.guildId!, {
        config: [
          {
            filterType: filter,
            words: words,
          }
        ],
        type: automodtype.BannedWords
      })
      interaction.update({
        embeds: [
          new EmbedBuilder()
          .setAuthor({
            name: `${interaction.client.user?.username}`,
            iconURL: `${interaction.client.user?.displayAvatarURL()}`,
          })
          .setColor("Blue")
          .setDescription("<:success:1146683498766291024> Added words.")
        ],
        components: []
      })
  }
} 