import { APISelectMenuOption, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Interaction, Message, RestOrArray, SelectMenuComponentOptionData, StringSelectMenuBuilder, StringSelectMenuComponentData, StringSelectMenuOptionBuilder } from "discord.js";
import { ConfigInstance } from "../../../../../../Main-Handler/ConfigHandler";
import { AutomodClass, RuleConfig, automodtype } from "../../../../../Classes/moderation/Automod/automod";
import { utils } from "../../../../../Classes/moderation/Automod/utils";
import ms from "ms";
const automodClass = AutomodClass.getInstance();

export default async (_: ConfigInstance, interaction: Interaction) => {
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
                action = action.charAt(0).toUpperCase() + action.substring(1);
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
                            .setFields({ name: `Current ${action}:`, value: `${val ? action === 'Duration' ? `${ms(val), { long: true }}` : `${val}` : "None"}` })
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
            } else if (action === 'words') {
                const config = automodClass.AutomodCollection.get(interaction.guildId!)?.rules.get(rule[1] as automodtype)?.config;
                action = action.charAt(0).toUpperCase() + action.substring(1)
                if (!config || !config.length) return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setDescription("You are yet to setup banned words. Please configure banned words to effectively manage them.")
                    ]
                })
                const options = config.map((filter: RuleConfig) => {
                    const { filterType } = filter;
                    return {
                        label: filterType?.charAt(0).toUpperCase()! + filterType?.substring(1),
                        value: filterType,
                    };
                }) as APISelectMenuOption[];

                interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setAuthor({
                                name: `${interaction.client.user?.username}`,
                                iconURL: `${interaction.client.user?.displayAvatarURL()}`,
                            })
                            .setColor("Blue")
                            .setTitle(rule[0])
                            .setDescription(`Select the filter you wish to modify. You have the option to either add new words or replace the entire existing set of words`)
                    ],
                    components: [
                        new ActionRowBuilder<StringSelectMenuBuilder>()
                            .addComponents(
                                new StringSelectMenuBuilder()
                                    .setCustomId(`${interaction.guildId}Automod_Manage_RuleType_${action}`)
                                    .setPlaceholder("Select Filter")
                                    .setMaxValues(1)
                                    .setMinValues(1)
                                    .setOptions(options)
                            )
                    ]
                });

            }
        }
        break;

        case `${interaction.guildId}Automod_Manage_RuleType_Words`: {
            const filter = interaction.values[0]
            const config = automodClass.AutomodCollection.get(interaction.guildId!)?.rules.get(automodtype.BannedWords as automodtype)?.config
            if (!config) return interaction.reply({ephemeral: true, content: "You need to setup banned words first."})
            const words = config.find(({filterType}) => filterType === filter)?.words
            interaction.update({
                embeds: [
                  interaction.message.embeds[0],
                  new EmbedBuilder()
                    .setColor('Blue')
                    .setTitle(filter)
                    .setDescription(`
                    ${words?.join(",")}
                    `)
                ],
                components: [
                    interaction.message.components[0],
                    new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                        .setLabel("Update Words")
                        .setCustomId(`${interaction.guildId}Automod_Manage_RuleType_Words_UpdateWords`)
                        .setStyle(ButtonStyle.Primary)
                    )
                ]
            })
        }
        break;
    }
};
