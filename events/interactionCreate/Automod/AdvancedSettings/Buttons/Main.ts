import { APIEmbed, APIEmbedField, ActionRowBuilder, ButtonBuilder, ButtonStyle, Embed, EmbedBuilder, Interaction, JSONEncodable } from "discord.js";
import { ConfigInstance } from "../../../../../Main-Handler/ConfigHandler";
import { AutomodClass } from "../../../../../classes/moderation/automod";
const automodClass = AutomodClass.getInstance()
export default async (instance: ConfigInstance, interaction: Interaction) => {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith(`${interaction.guildId}Automod_Setup_AdvancedSetting`)) return;

    switch(interaction.customId) {
        case `${interaction.guildId}Automod_Setup_AdvancedSetting_IgnoredChannels_Confirm` : {
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
            const [mainEmbed, infoEmbed] = interaction.message.embeds as Embed[];
            let fields = infoEmbed.data?.fields as APIEmbedField[]
            const updatedInfoEmbed = fields[0].name === 'Channel(s)' 
                ? new EmbedBuilder(infoEmbed.data).setFields(fields[0] ?? undefined).toJSON()
                : undefined;
            const embeds = [new EmbedBuilder(mainEmbed.data).toJSON(), updatedInfoEmbed].filter(Boolean) as (APIEmbed | JSONEncodable<APIEmbed>)[];
            interaction.update({ embeds, components: automodClass.utils(interaction).constants.AdvancedSettings.IgnoredRoles.components });
        }
        break;

        case `${interaction.guildId}Automod_Setup_AdvancedSetting_IgnoredRoles`: {
            interaction.update(automodClass.utils(interaction).constants.AdvancedSettings.IgnoredRoles)
        }
        break;

        case `${interaction.guildId}Automod_Setup_AdvancedSetting_CustomAction_Cancel`: {
            const [main, info] = interaction.message.embeds;
            const fields = info?.fields?.filter(val => val.name !== "Action") ?? [];
            const embeds = [new EmbedBuilder(main?.data)];
        
            if (fields.length > 0) {
                embeds.push(new EmbedBuilder(info.data).setFields(fields));
            }
        
            interaction.update({
                embeds: embeds,
                components: automodClass.utils(interaction).constants.AdvancedSettings.CustomAction.components
            });
            break;
        }
        
        
        case `${interaction.guildId}Automod_Setup_AdvancedSetting_CustomAction_Confirm`: {

        }
        break;
    }
} 