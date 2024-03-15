import { ApplicationCommandOptionType, EmbedBuilder, Guild, PermissionFlagsBits, parseEmoji } from "discord.js";
import { CommandType } from "../../../Main-Handler/ConfigHandler";
import { Callback, Command } from "../../../Main-Handler/typings";

export default {
    name: 'emojify',
    description: 'Emoji utility',
    type: CommandType.slash,
    permissions: [PermissionFlagsBits.ManageGuildExpressions],
    options: [
        {
            name: "steal",
            description: "create emojis",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "emoji",
                    description: "Enter the emoji you want to steal",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: "name",
                    description: "enter the name for the emoji",
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
        {
            name: "image",
            description: "Get image of the emoji given",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "emoji",
                    description: "enter the emoji you want the image of.",
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
        {
            name: 'create',
            description: "Create emoji in the server",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "url",
                    description: "Url of the emoji, preferably .png",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: "name",
                    description: "Name of the emoji to be created",
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        }
    ],
    callback: async ({ interaction }: Callback) => {
        if (interaction) {
            await interaction.deferReply()
            if (interaction.options.getSubcommand() == 'steal') {
                const emoji = interaction.options.getString('emoji') as string
                const parsed = parseEmoji(emoji)
                if (parsed && parsed.id) {
                    const extension = parsed.animated ? '.gif' : '.png';
                    const url = `https://cdn.discordapp.com/emojis/${parsed.id + extension}`
                    const name = interaction.options.getString('name') as string

                    const lebron = await interaction.guild?.emojis.create({ name, attachment: url })
                    await interaction.editReply(`Stole ${lebron}!`)
                }
            } else if (interaction.options.getSubcommand() == 'image') {
                const emoji = interaction.options.getString('emoji') as string
                const parsed = parseEmoji(emoji)
                if (parsed && parsed.id) {
                    const extension = parsed.animated ? '.gif' : '.png';
                    const url = `https://cdn.discordapp.com/emojis/${parsed.id + extension}`
                    await interaction.editReply(`${url}`)
                }
            } else if (interaction.options.getSubcommand() == 'create') {
                const url = interaction.options.getString('url') as string
                const name = interaction.options.getString('name') as string
                interaction.guild?.emojis.create({
                    name,
                    attachment: url
                }).catch((err) => {
                    interaction.editReply({
                        embeds: [new EmbedBuilder().setColor('Red').setDescription(`${err.message || "Make sure the url is correct!"}`)]
                    })
                })
            }
        } else {

        }
    },
    extraInfo: {
        command_detailedExplaination: "{COMMAND} command has 3 subcommands, namely, \`Steal Create Image\`\n**1. Steal**->Input a valid __discord custom emoji__ and a valid name shorter than 20 characters to steal the emoji into the current server!\n\n**2. Image**->Input a valid __discord custom emoji__ to enlargen it into an image.\n\n**3.Create**\n->Input a valid link and a valid name less than 20 characters to create a new emoji into the current server!",
        command_example: "/{COMMAND} steal emoji: <:DiscordMod:1158844887999987732> name: \`mod\`"
    }
} as Command