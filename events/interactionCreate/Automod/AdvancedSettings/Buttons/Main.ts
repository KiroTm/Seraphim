import { APIEmbed, APIEmbedField, ActionRowBuilder, ButtonBuilder, ButtonStyle, Embed, EmbedBuilder, Interaction, JSONEncodable, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { ConfigInstance } from "../../../../../Main-Handler/ConfigHandler";
import { AutomodClass } from "../../../../../classes/moderation/automod";
const automodClass = AutomodClass.getInstance()
export interface AdvancedSettingFields {
    Channel: string[];
    Role: string[];
    Action: 'Kick' | 'Warn' | 'Mute' | 'Ban' | 'None';
    Threshold: number;
}
export default async (instance: ConfigInstance, interaction: Interaction) => {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith(`${interaction.guildId}Automod_Setup_AdvancedSetting`)) return;

    switch (interaction.customId) {
        case `${interaction.guildId}Automod_Setup_AdvancedSetting_IgnoredChannels_Confirm`: {
            const object = automodClass.utils(interaction).constants.AdvancedSettings.IgnoredRoles
            const embeds = object.embeds as any[]
            if (interaction.isButton() && interaction?.message?.embeds[1]?.title === "Info:") embeds.push(interaction.message.embeds[1])
            interaction.update({
                embeds: embeds,
                components: object.components
            })
        }
            break;

        case `${interaction.guildId}Automod_Setup_AdvancedSetting`: {
            interaction.update(automodClass.utils(interaction).constants.AdvancedSettings.Main)
        }
            break;

        case `${interaction.guildId}Automod_Setup_AdvancedSetting_IgnoredChannels`: {
            interaction.update(automodClass.utils(interaction).constants.AdvancedSettings.IgnoredChannels)
        }
            break;

        case `${interaction.guildId}Automod_Setup_AdvancedSetting_IgnoredChannels_Cancel`: {
            interaction.update(automodClass.utils(interaction).constants.AdvancedSettings.IgnoredChannels)
        }
            break;

        case `${interaction.guildId}Automod_Setup_AdvancedSetting_IgnoredRoles_Cancel`: {
            const [main, info] = interaction.message.embeds as Embed[];
            const embeds = automodClass.utils(interaction).functions.General.RemoveField(main, info, "Role")
            interaction.update({ embeds, components: automodClass.utils(interaction).constants.AdvancedSettings.IgnoredRoles.components });
        }
            break;

        case `${interaction.guildId}Automod_Setup_AdvancedSetting_IgnoredRoles`: {
            interaction.update(automodClass.utils(interaction).constants.AdvancedSettings.IgnoredRoles)
        }
            break;

        case `${interaction.guildId}Automod_Setup_AdvancedSetting_CustomAction_Cancel`: {
            const [main, info] = interaction.message.embeds;
            const embeds = automodClass.utils(interaction).functions.General.RemoveField(main, info, "Action")
            interaction.update({
                embeds,
                components: automodClass.utils(interaction).constants.AdvancedSettings.CustomAction.components
            });
        }
            break;

        case `${interaction.guildId}Automod_Setup_AdvancedSetting_Threshold_Setup`: {
            const modal = new ModalBuilder()
                .setTitle("Threshold")
                .setCustomId(`${interaction.guildId}Automod_Setup_AdvancedSetting_Threshold_Modal`)
                .addComponents(
                    new ActionRowBuilder<TextInputBuilder>()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId(`${interaction.guildId}Modal_Threshold`)
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                                .setMaxLength(1)
                                .setLabel("Threshold")
                                .setValue('2')
                        )
                )
            await interaction.showModal(modal)
        }
            break;

        case `${interaction.guildId}Automod_Setup_AdvancedSetting_Threshold_Cancel`: {
            const [main, info] = interaction.message.embeds;
            const embeds = automodClass.utils(interaction).functions.General.RemoveField(main, info, "Threshold")
            interaction.update({
                embeds,
                components: automodClass.utils(interaction).constants.AdvancedSettings.Threshold.components
            });
        }
            break;

        case `${interaction.guildId}Automod_Setup_AdvancedSetting_Threshold_Confirm`: {
            const fields = interaction.message.embeds[1]?.fields ?? [];
            await interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Green')
                        .setDescription(`<a:loading:1166992405199859733> Processing your submission`)
                ],
                components: []
            });

            const defaultSettings: AdvancedSettingFields = {
                Channel: [],
                Role: [],
                Action: 'None',
                Threshold: 2
            };

            for (const key in defaultSettings) {
                if (Object.prototype.hasOwnProperty.call(defaultSettings, key)) {
                    const field = fields.find((val) => val.name.toLowerCase() === key.toLowerCase());
                    defaultSettings[key as keyof AdvancedSettingFields] = (field ? (field.value as string | string[]) : getDefault(key as keyof AdvancedSettingFields)) as never 
                }
            }

            const settingsString = Object.entries(defaultSettings).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value ?? "none"}`).join('\n');
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Green')
                        .setDescription(settingsString)
                ]
            });

            function getDefault(key: keyof AdvancedSettingFields): string | string[] | 'None' | number {
                switch (key) {
                    case 'Channel':
                    case 'Role':
                        return [];
                    case 'Action':
                        return 'None';
                    case 'Threshold':
                        return 2;
                    default:
                        return ''; // Or appropriate default value
                }
            }
        }
            break;

    }
}   