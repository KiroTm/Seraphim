import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Interaction, ModalBuilder, SelectMenuComponentOptionData, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { ConfigInstance } from "../../../../../Main-Handler/ConfigHandler";
import { utils } from "../../../../../classes/moderation/Automod/utils";
import { AutomodClass, automodtype } from "../../../../../classes/moderation/Automod/automod";
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
        const updatedField = ms(interaction.message.embeds[0].data.fields![0].value!)
        automodClass.updateQueryField(interaction.guildId!, (config?.type ?? ruletype) as automodtype, updatedField)
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
                          .setFields({name: `Current ${type}:`, value: `${val ? type === 'duration' ? `${ms(val), { long: true }}` : `${val}` : "None"}`})
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
    }

}