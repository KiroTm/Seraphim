import { APIStringSelectComponent, ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, Client, EmbedBuilder, PermissionFlagsBits, SelectMenuComponentOptionData, StringSelectMenuBuilder, StringSelectMenuComponent, messageLink } from "discord.js";
import { Callback, Command } from "../../typings";
import { AutomodClass, automodtype } from "../../classes/moderation/automod";
import { CommandType } from "../../Main-Handler/ConfigHandler";
const automodClass = AutomodClass.getInstance();
export default {
    name: 'automod',
    description: 'Automod module.',
    type: CommandType.both,
    permissions: [PermissionFlagsBits.AddReactions],
    options: [
        {
            name: "config",
            description: "Add new rules to the automod module.",
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: "manage",
            description: "Manage completed automod module.",
            type: ApplicationCommandOptionType.Subcommand
        }
    ],
    callback: async ({ interaction }: Callback) => {
        if (interaction) {
            await interaction.deferReply({ ephemeral: true })
            const Subcommand = interaction.options.getSubcommand()
            if (Subcommand === 'config') {
                await interaction.editReply(automodClass.utils(interaction).constants.Main)
            } else if (Subcommand === 'manage') {

            }
        }
    }
} as Command