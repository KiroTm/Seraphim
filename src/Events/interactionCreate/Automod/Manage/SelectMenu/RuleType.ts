import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Interaction, Message, StringSelectMenuBuilder, StringSelectMenuComponentData } from "discord.js";
import { ConfigInstance } from "../../../../../../Main-Handler/ConfigHandler";
import { AutomodClass, automodtype } from "../../../../../Classes/moderation/Automod/automod";
import { utils } from "../../../../../Classes/moderation/Automod/utils";
import ms from "ms";
const automodClass = AutomodClass.getInstance();

export default async (instance: ConfigInstance, interaction: Interaction) => {
    if (!interaction.isStringSelectMenu() || !interaction.customId.startsWith(`${interaction.guildId}Automod_Manage`)) return;

    const components = interaction.message?.components;
    const data = components[0]?.components[0]?.data as Partial<StringSelectMenuComponentData>;
    let rule = Object.entries(automodtype).find(([_, automodtype]) => automodtype === data.options?.find((option) => option.default === true)?.value as automodtype)! as automodtype | [string, automodtype]
    switch (interaction.customId) {
        case `${interaction.guildId}Automod_Manage_RuleType`: {
            rule = interaction.values[0] as automodtype
            const ruleconfig = automodClass.AutomodCollection.get(interaction.guildId!)?.rules;
            const options = utils(interaction).functions.Manage.constructRuleType(ruleconfig, rule);
            await interaction.update({
                components: [
                    new ActionRowBuilder<StringSelectMenuBuilder>()
                        .addComponents(
                            new StringSelectMenuBuilder(data)
                                .setOptions(options)
                        ),
                    new ActionRowBuilder<StringSelectMenuBuilder>()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId(`${interaction.guildId}Automod_Manage_RuleType_Action`)
                                .setMinValues(1)
                                .setMaxValues(1)
                                .setPlaceholder("Select an Action")
                                .setOptions(...utils(interaction).functions.Manage.constructActionOptions(rule))
                        )
                ]
            });
            break;
        }

        case `${interaction.guildId}Automod_Manage_RuleType_Action`: {
            await interaction.deferReply({ ephemeral: true });
            let action = interaction.values[0];
            if (action === "enable" || action == "disable") {
                const ruleType = rule[1];
                automodClass.enableorDisableRuleType(interaction.guildId!, ruleType as automodtype, action === 'disable');
                const options = utils(interaction).functions.Manage.constructRuleType(automodClass.AutomodCollection.get(interaction.guildId!)?.rules, ruleType);

                interaction.editReply({
                    message: interaction.message as Message,
                    components: [
                        new ActionRowBuilder<StringSelectMenuBuilder>()
                            .addComponents(
                                new StringSelectMenuBuilder(data)
                                    .setOptions(options),
                            ),
                        new ActionRowBuilder<StringSelectMenuBuilder>()
                            .addComponents(
                                new StringSelectMenuBuilder(components[1].components[0].data as Partial<StringSelectMenuComponentData>)
                            )
                    ]
                });
                interaction.editReply({
                    embeds: [new EmbedBuilder().setColor('DarkBlue').setDescription(`<:success:1146683498766291024> **${rule[0]}** has been ${action === 'disable' ? "disabled" : "enabled"}!`)]
                });
            } else if (action === 'advancedsettings') {
                const { embeds, components } = utils(interaction).constants.AdvancedSettings.IgnoredChannels;
                await interaction.editReply({
                    embeds: [embeds[0].setTitle(rule[0])],
                    components
                });
            } else if (action === 'limit' || action === 'duration') {
                const config = automodClass.AutomodCollection.get(interaction.guildId!)?.rules.get(rule[1] as automodtype)
                const val = config?.config?.[0].Query
                action = action.charAt(0).toUpperCase() + action.substring(1)
                interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                          .setAuthor({
                            name: `${interaction.client.user?.username}`,
                            iconURL: `${interaction.client.user?.displayAvatarURL()}`,
                          })
                          .setColor("Blue")
                          .setTitle(rule[0])
                          .setDescription(`Update or set a new ${action} to your rule!`)
                          .setFields({name: `Current ${action}:`, value: `${val ? action === 'Duration' ? `${ms(val), { long: true }}` : `${val}` : "None"}`})
                        ],
                      components: [
                        new ActionRowBuilder<ButtonBuilder>().addComponents(
                          new ButtonBuilder()
                            .setCustomId(
                              `${interaction.guildId}Automod_Manage_RuleType_${action}`,
                            )
                            .setStyle(ButtonStyle.Primary)
                            .setLabel(`Edit ${action}`),
                        ),
                      ],
                })
            }
        }
    }
};
