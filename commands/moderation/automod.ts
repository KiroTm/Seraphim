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
            const client = interaction.client as Client
            await interaction.deferReply({ ephemeral: true })
            const Subcommand = interaction.options.getSubcommand()
            const options = Object.keys(automodtype).map(key => ({ label: key.replace(/([a-z])([A-Z])/g, '$1 $2'), value: automodtype[key as keyof typeof automodtype] })) as SelectMenuComponentOptionData[]
            if (Subcommand === 'config') {
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                        .setColor('Blue')
                        .setAuthor({name: `${client.user?.username}`, iconURL: `${client.user?.displayAvatarURL()}`})
                        .setDescription(`**🌟 Welcome to AutoMod Configuration!**\nElevate your server's moderation game with AutoMod by ${client.user?.username}! 🤖✨\n\n**Getting Started:**\n\n1. **Rule Selection:**\n   - Choose the type of rule you want to configure from a variety of options.\n\n2. **Fine-Tune Settings:**\n   - Customize each rule to suit your server's unique needs.\n\n3. **Instant Moderation:**\n   - Enjoy swift moderation actions for rule violations.\n\n4. **Rule Combos:**\n   - Explore the possibilities of combining rules for comprehensive moderation.\n\nEmpower your server with the advanced moderation features of AutoMod. Follow these steps and ensure a safer and more enjoyable community experience!`)
                    ],
                    components: [
                        new ActionRowBuilder<StringSelectMenuBuilder>()
                        .addComponents(
                            new StringSelectMenuBuilder()
                            .setPlaceholder("Select automod rule type")
                            .setCustomId(`${interaction.guildId}Automod_Setup_RuleType_SelectMenu`)
                            .addOptions(options)
                        )
                    ]
                })
            } else if (Subcommand === 'manage') {

            }
        }
    }
} as Command