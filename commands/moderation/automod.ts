import { ApplicationCommandOptionType, Client, EmbedBuilder, messageLink } from "discord.js";
import { Callback, Command } from "../../typings";
import { AutomodClass, automodtype } from "../../classes/moderation/automod";
const automodClass = AutomodClass.getInstance();
export default {
    name: 'automod',
    description: 'Automod module.',
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
            const client = interaction.client as Client
            await interaction.deferReply({ ephemeral: true })
            const Subcommand = interaction.options.getSubcommand()
            if (Subcommand === 'config') {
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                        .setColor('Blue')
                        .setAuthor({name: `${client.user?.username}`, iconURL: `${client.user?.displayAvatarURL()}`})
                        .setDescription("Initiate the configuration process for AutoMod on this server to enhance moderation functionalities. This service is seamlessly provided by Seraphim, your trusted Discord.js bot")
                    ]
                })
            } else if (Subcommand === 'manage') {

            }
        }
    }
} as Command