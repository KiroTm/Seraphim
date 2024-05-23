import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType, ComponentType, Embed, EmbedBuilder, Interaction, Message, MessageComponent, ModalBuilder, RoleSelectMenuBuilder, StringSelectMenuBuilder, TextChannel, TextInputBuilder, TextInputStyle } from "discord.js";
import { ConfigHandler } from "../../../../../OldHandler/ConfigHandler";
import TicketSetup from "../../../../Models/TicketSetup";

export default async (instance: ConfigHandler, interaction: Interaction) => {
    if (interaction.isButton()) {
        const CustomIds = [
            `${interaction.guildId}Manage_Panel`,
            `${interaction.guildId}Panel_Restart`,
            `${interaction.guildId}Panel_Manage_Rename`,
            `${interaction.guildId}Panel_Manage_Button_Emoji`,
            `${interaction.guildId}Panel_Manage_Button_Text`,
            `${interaction.guildId}Panel_Manage_Return`,
            `${interaction.guildId}Panel_Manage_Description`
        ]
        if (!CustomIds.includes(interaction.customId)) return;

        switch (interaction.customId) {
            case `${interaction.guildId}Manage_Panel`: {
                const Panels = await TicketSetup.find({ GuildID: interaction.guildId, SetupDone: true }) as Array<any>
                if (Panels.length == 0) return interaction.update({ content: "You haven't created any panels yet!", embeds: [], components: [] })
                const StringSelectMenu = new StringSelectMenuBuilder()
                    .setCustomId(`${interaction.guildId}Panel_Manage_ActionRow_Main`)
                    .setMaxValues(1)
                    .setMinValues(1)
                    .setPlaceholder("Select Panel(s)");
                let i = 0;
                Panels.forEach((p) => {
                    i++
                    StringSelectMenu.addOptions(
                        {
                            label: `[${i}] ${p.Type}`,
                            value: `${p._id}`
                        }
                    )
                });
                const Row = new ActionRowBuilder<StringSelectMenuBuilder>()
                    .addComponents(StringSelectMenu);
                await interaction.update({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Yellow')
                            .setDescription("Manage your completed panels!")
                    ],
                    components: [Row]
                })
            }
                break;

            case `${interaction.guildId}Panel_Restart`: {
                const MainPageRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setLabel("Manage Panel")
                        .setCustomId(`${interaction.guild?.id}Manage_Panel`)
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('🗄️'),

                    new ButtonBuilder()
                        .setLabel("Create Panel")
                        .setCustomId(`${interaction.guild?.id}Create_Panel`)
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('<:Add:1094332442615226378>')
                );
                await interaction.update({
                    content: null,
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`Welcome to ${instance._client?.user?.username} Tickets`)
                            .setColor('Yellow')
                            .setDescription("You can Manage your current panels (if any) or create new panels from scratch.")
                            .setImage("https://cdn.discordapp.com/attachments/1093819378044239913/1094246476344991754/Tickets.gif")
                    ],
                    components: [MainPageRow]
                })
            }
                break;

            case `${interaction.guildId}Panel_Manage_Rename`: {
                const Modal = new ModalBuilder()
                    .setCustomId(`${interaction.guildId}Panel_Manage_Name_Modal`)
                    .setTitle('Set Panel Name')
                    .addComponents(
                        new ActionRowBuilder({
                            components: [
                                new TextInputBuilder()
                                    .setCustomId(`${interaction.guildId}Panel_Manage_Name_Modal_Value`)
                                    .setLabel('Name')
                                    .setValue('Support Ticket')
                                    .setMaxLength(50)
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short),
                            ]
                        })
                    )
                await interaction.showModal(Modal);
            }
                break;

            case `${interaction.guildId}Panel_Manage_Button_Emoji`: {
                const Modal = new ModalBuilder()
                    .setCustomId(`${interaction.guildId}Panel_Manage_Button_Emoji_Modal`)
                    .setTitle('Set Panel Button Emoji')
                    .addComponents(
                        new ActionRowBuilder({
                            components: [
                                new TextInputBuilder()
                                    .setCustomId(`${interaction.guildId}Panel_Manage_Button_Emoji_Modal_Value`)
                                    .setLabel('Name')
                                    .setValue('🎫')
                                    .setMaxLength(50)
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short),
                            ]
                        })
                    )
                await interaction.showModal(Modal);
            }
                break;

            case `${interaction.guildId}Panel_Manage_Button_Text`: {
                const Modal = new ModalBuilder()
                    .setCustomId(`${interaction.guildId}Panel_Manage_Button_Text_Modal`)
                    .setTitle('Set Panel Button Name')
                    .addComponents(
                        new ActionRowBuilder({
                            components: [
                                new TextInputBuilder()
                                    .setCustomId(`${interaction.guildId}Panel_Manage_Button_Text_Modal_Value`)
                                    .setLabel('Name')
                                    .setMaxLength(15)
                                    .setRequired(true)
                                    .setMinLength(1)
                                    .setStyle(TextInputStyle.Short),
                            ]
                        })
                    )
                await interaction.showModal(Modal);
            }
                break;

            case `${interaction.guildId}Panel_Manage_Return`: {
                const Panels = await TicketSetup.find({ GuildID: interaction.guildId, SetupDone: true }) as Array<any>
                if (Panels.length == 0) return interaction.update({ content: "You haven't created any panels yet!", embeds: [], components: [] })
                const StringSelectMenu = new StringSelectMenuBuilder()
                    .setCustomId(`${interaction.guildId}Panel_Manage_ActionRow_Main`)
                    .setMaxValues(1)
                    .setMinValues(1)
                    .setPlaceholder("Select Panel(s)");
                let i = 0;
                Panels.forEach((p) => {
                    i++
                    StringSelectMenu.addOptions(
                        {
                            label: `[${i}] ${p.Type}`,
                            value: `${p._id}`
                        }
                    )
                });
                const Row = new ActionRowBuilder<StringSelectMenuBuilder>()
                    .addComponents(StringSelectMenu);

                const id = interaction.message.content.replace("Panel ID: ", "") as string
                const data = await TicketSetup.findOne({
                    _id: id,
                    GuildID: interaction.guildId
                })
                if (!data) {
                    return await interaction.update({
                        embeds: [],
                        components: [],
                        content: "Invalid Panel! This panel was deleted by your moderator(s)"
                    })
                }
                await interaction.update({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Yellow')
                            .setDescription("Manage your completed panels!")
                    ],
                    content: `Panel ID: ${id}`,
                    components: [
                        Row,
                        new ActionRowBuilder<StringSelectMenuBuilder>()
                            .addComponents(
                                new StringSelectMenuBuilder()
                                    .setCustomId(`${interaction.guildId}Panel_Manage_ActionRow_Action`)
                                    .setMaxValues(1)
                                    .setMinValues(1)
                                    .setPlaceholder(`Choose an action.`)
                                    .setOptions(
                                        {
                                            label: "Panel Name",
                                            value: "1",
                                            emoji: "1️⃣"
                                        },
                                        {
                                            label: "Panel Support Roles",
                                            value: "2",
                                            emoji: "2️⃣"
                                        },
                                        {
                                            label: "Panel Category",
                                            value: "3",
                                            emoji: "3️⃣"
                                        },
                                        {
                                            label: "Panel Transcripts",
                                            value: "4",
                                            emoji: "4️⃣"
                                        },
                                        {
                                            label: "Panel Description",
                                            value: "5",
                                            emoji: "5️⃣"
                                        },
                                        {
                                            label: "Panel Button Emoji",
                                            value: "6",
                                            emoji: "6️⃣"
                                        },
                                        {
                                            label: "Panel Button Text",
                                            value: "7",
                                            emoji: "7️⃣"
                                        },
                                        {
                                            label: "Panel Send",
                                            value: "8",
                                            emoji: "8️⃣"
                                        },
                                        {
                                            label: "Panel Delete",
                                            value: "9",
                                            emoji: "9️⃣"
                                        }
                                    )
                            )
                    ]
                })
            }
                break;

            case `${interaction.guildId}Panel_Manage_Description`: {
                const Modal = new ModalBuilder()
                    .setCustomId(`${interaction.guildId}Panel_Manage_Description`)
                    .setTitle('Set Panel Embed Description')
                    .addComponents(
                        new ActionRowBuilder({
                            components: [
                                new TextInputBuilder()
                                    .setCustomId(`${interaction.guildId}Panel_Manage_Description_Value`)
                                    .setLabel('Description')
                                    .setMaxLength(1000)
                                    .setRequired(true)
                                    .setMinLength(10)
                                    .setStyle(TextInputStyle.Paragraph),
                            ]
                        })
                    )
                await interaction.showModal(Modal)
            }
                break;
        }
    } else if (interaction.isStringSelectMenu()) {
        switch (interaction.customId) {
            case `${interaction.guildId}Panel_Manage_ActionRow_Main`: {
                const id = interaction.values[0] as string
                const data = await TicketSetup.findOne({
                    _id: id,
                    GuildID: interaction.guildId
                })
                if (!data) {
                    return await interaction.update({
                        embeds: [],
                        components: [],
                        content: "Invalid Panel! This panel was deleted by your moderator(s)"
                    })
                }
                const message = interaction.message as Message
                await interaction.update({
                    content: `Panel ID: ${id}`,
                    components: [
                        message.components[0],
                        new ActionRowBuilder<StringSelectMenuBuilder>()
                            .addComponents(
                                new StringSelectMenuBuilder()
                                    .setCustomId(`${interaction.guildId}Panel_Manage_ActionRow_Action`)
                                    .setMaxValues(1)
                                    .setMinValues(1)
                                    .setPlaceholder(`Choose an action.`)
                                    .setOptions(
                                        {
                                            label: "Panel Name",
                                            value: "1",
                                            emoji: "1️⃣"
                                        },
                                        {
                                            label: "Panel Support Roles",
                                            value: "2",
                                            emoji: "2️⃣"
                                        },
                                        {
                                            label: "Panel Category",
                                            value: "3",
                                            emoji: "3️⃣"
                                        },
                                        {
                                            label: "Panel Transcripts",
                                            value: "4",
                                            emoji: "4️⃣"
                                        },
                                        {
                                            label: "Panel Description",
                                            value: "5",
                                            emoji: "5️⃣"
                                        },
                                        {
                                            label: "Panel Button Emoji",
                                            value: "6",
                                            emoji: "6️⃣"
                                        },
                                        {
                                            label: "Panel Button Text",
                                            value: "7",
                                            emoji: "7️⃣"
                                        },
                                        {
                                            label: "Panel Send",
                                            value: "8",
                                            emoji: "8️⃣"
                                        },
                                        {
                                            label: "Panel Delete",
                                            value: "9",
                                            emoji: "9️⃣"
                                        }
                                    )
                            )
                    ]
                })
            }
                break;

            case `${interaction.guildId}Panel_Manage_ActionRow_Action`: {
                const id = interaction.message.content.replace("Panel ID: ", "") as string
                const data = await TicketSetup.findOne({
                    _id: id,
                    GuildID: interaction.guildId
                })
                if (!data) {
                    return await interaction.update({
                        components: [],
                        embeds: [],
                        content: "Couldn't find a panel with this id, this panel was recently deleted by a moderator of yours"
                    })
                }
                switch (interaction.values[0]) {
                    case "1": {
                        await interaction.update({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor("Blue")
                                    .setDescription("Rename the panel as you like."),

                                new EmbedBuilder()
                                    .setColor("Blurple")
                                    .setTitle("Current Name:")
                                    .setDescription(`\`${data.Type}\``)
                            ],
                            components: [
                                new ActionRowBuilder<ButtonBuilder>()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setStyle(ButtonStyle.Secondary)
                                            .setCustomId(`${interaction.guildId}Panel_Manage_Rename`)
                                            .setLabel("Rename"),

                                        new ButtonBuilder()
                                            .setLabel("Save & Continue")
                                            .setCustomId(`${interaction.guild?.id}Panel_Manage_Return`)
                                            .setStyle(ButtonStyle.Primary)
                                            .setEmoji('<:Folder:1092058483848917032>')

                                    )
                            ]
                        })
                    }
                        break;

                    case "2": {
                        await interaction.update({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('Blue')
                                    .setTitle("Select the support team role(s)")
                                    .setDescription(`Members as with such role(s) can moderate tickets, they're automatically added to the tickets.\n\nUse the dropdown menu to select or search the role(s)`),

                                new EmbedBuilder()
                                    .setColor('Blue')
                                    .setTitle("Support team role(s):")
                                    .setDescription(`${data.Handlers.map((id: any) => { return `<@&${id}>` }).join(", ")}`)
                            ],
                            components: [
                                new ActionRowBuilder<RoleSelectMenuBuilder>()
                                    .addComponents(
                                        new RoleSelectMenuBuilder({
                                            custom_id: `${interaction.guildId}Panel_Manage_RoleSelect_Support`,
                                            placeholder: "Select Ticket Managers/Helpers",
                                            type: ComponentType.RoleSelect,
                                            maxValues: 5,
                                            minValues: 1
                                        })
                                    ),
                                new ActionRowBuilder<ButtonBuilder>()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setLabel("Save & Continue")
                                            .setCustomId(`${interaction.guild?.id}Panel_Manage_Return`)
                                            .setStyle(ButtonStyle.Primary)
                                            .setEmoji('<:Folder:1092058483848917032>')
                                    )
                            ]
                        })
                    }
                        break;

                    case "3": {
                        await interaction.update({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('Blue')
                                    .setTitle(`Select ticket category`)
                                    .setDescription("Select the category in which the tickets will be created."),

                                new EmbedBuilder()
                                    .setColor('Blue')
                                    .setTitle("Category")
                                    .setDescription(`<#${data.Category}>`)
                            ],
                            components: [
                                new ActionRowBuilder<ChannelSelectMenuBuilder>()
                                    .addComponents(
                                        new ChannelSelectMenuBuilder()
                                            .setChannelTypes(ChannelType.GuildCategory)
                                            .setCustomId(`${interaction.guildId}Panel_Manage_ChannelSelect_Category`)
                                            .setMinValues(1)
                                            .setMaxValues(1)
                                            .setPlaceholder("Select a category")
                                    ),
                                new ActionRowBuilder<ButtonBuilder>()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setLabel("Save & Continue")
                                            .setCustomId(`${interaction.guild?.id}Panel_Manage_Return`)
                                            .setStyle(ButtonStyle.Primary)
                                            .setEmoji('<:Folder:1092058483848917032>')
                                    )
                            ]
                        })
                    }
                        break;

                    case "4": {
                        await interaction.update({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('Blue')
                                    .setTitle("Select the channel to send transcripts into.")
                                    .setDescription("Transcript is a document that stores the channel chats!\nThis tool is useful to review tickets even after they're closed.\n\nYou can skip this part of you don't want transripts. "),

                                new EmbedBuilder()
                                    .setColor('Blue')
                                    .setTitle("Transcript Channel:")
                                    .setDescription(`${data.Transcripts == "None" ? "None" : `<#${data.Transcripts}>`}`)
                            ],
                            components: [
                                new ActionRowBuilder<ChannelSelectMenuBuilder>()
                                    .addComponents(
                                        new ChannelSelectMenuBuilder()
                                            .setChannelTypes(ChannelType.GuildText)
                                            .setCustomId(`${interaction.guildId}Panel_Manage_ChannelSelect_Transcript`)
                                            .setMaxValues(1)
                                            .setPlaceholder("Select a channel.")
                                    ),
                                new ActionRowBuilder<ButtonBuilder>()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setLabel("Save & Continue")
                                            .setCustomId(`${interaction.guild?.id}Panel_Manage_Return`)
                                            .setStyle(ButtonStyle.Primary)
                                            .setEmoji('<:Folder:1092058483848917032>')
                                    )
                            ]
                        })
                    }
                        break;

                    case "5": {
                        await interaction.update({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('Blue')
                                    .setTitle("Panel Description")
                                    .setDescription("This will be displayed within your Panel Embed, you might put general information about your panel. A Panel Description may contain Ticket Guidance as per your choice.\nNote, you might need to use special \"Characters\" to format your description.\n\n**⚠️ Please read this before you get into using this.**\n**1.** To introduce new line, use **{n}** at the end of your sentence.\nExample: \"Hello{n}World\" will be displayed as:\n```\nHello\nWorld\n```\nYou can use many of these together, do not spam it however.\n\n\n**2.** To embed hyperlinks, you can use this format: \`[Any Text](A valid link here)\`.\nExample: \`[Hello World](https://www.youtube.com/watch?v=iik25wqIuFo)\` will be displayed as \"[Hello World](https://www.youtube.com/watch?v=iik25wqIuFo)\"")
                            ],
                            components: [
                                new ActionRowBuilder<ButtonBuilder>()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setCustomId(`${interaction.guildId}Panel_Manage_Description`)
                                            .setLabel("Description")
                                            .setEmoji("<:Plus:1095034402024718438>")
                                            .setStyle(ButtonStyle.Secondary)
                                    ),
                                new ActionRowBuilder<ButtonBuilder>()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setLabel("Save & Continue")
                                            .setCustomId(`${interaction.guild?.id}Panel_Manage_Return`)
                                            .setStyle(ButtonStyle.Primary)
                                            .setEmoji('<:Folder:1092058483848917032>')
                                    )
                            ]
                        })
                    }
                        break;

                    case "6": {
                        await interaction.update({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('Blue')
                                    .setTitle('Panel Button Emoji')
                                    .setDescription("Get your Panel Button a nice Emoji.\nThis will be displayed right next to your Panel Button Name which we will configure in the next step.\n\nExample of how the emoji would look like:")
                                    .setImage("https://cdn.discordapp.com/attachments/1093819378044239913/1094893608714387538/image_1.png"),
                                new EmbedBuilder()
                                    .setColor('Blue')
                                    .setTitle('Emoji:')
                                    .setDescription("Emoji Recieved: `none`")
                                    .setFooter({
                                        text: "Default emoji is \"🎫\""
                                    })
                            ],
                            components: [
                                new ActionRowBuilder<ButtonBuilder>()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setCustomId(`${interaction.guildId}Panel_Manage_Button_Emoji`)
                                            .setLabel("Emoji")
                                            .setEmoji("<:Plus:1095034402024718438>")
                                            .setStyle(ButtonStyle.Secondary)
                                    ),
                                new ActionRowBuilder<ButtonBuilder>()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setLabel("Save & Continue")
                                            .setCustomId(`${interaction.guild?.id}Panel_Manage_Return`)
                                            .setStyle(ButtonStyle.Primary)
                                            .setEmoji('<:Folder:1092058483848917032>')
                                    )
                            ]

                        })
                    }
                        break;

                    case "7": {
                        await interaction.update({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('Blue')
                                    .setTitle("Panel Button Text")
                                    .setDescription('Give your Panel Button a nice name.\nThis is will displayed right next to your button emoji which we configured in the last step.\n\nThis is an example of how the Button will look:')
                                    .setImage("https://cdn.discordapp.com/attachments/1093819378044239913/1094893608714387538/image_1.png"),
                                new EmbedBuilder()
                                    .setColor('Blue')
                                    .setTitle('Text:')
                                    .setDescription(`Text Recieved: \`${data.Button}\``)
                                    .setFooter({
                                        text: "Default Text is \"Ticket\""
                                    })
                            ],
                            components: [
                                new ActionRowBuilder<ButtonBuilder>()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setCustomId(`${interaction.guildId}Panel_Manage_Button_Text`)
                                            .setLabel("Text")
                                            .setEmoji("<:Plus:1095034402024718438>")
                                            .setStyle(ButtonStyle.Secondary)
                                    ),
                                new ActionRowBuilder<ButtonBuilder>()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setLabel("Save & Continue")
                                            .setCustomId(`${interaction.guild?.id}Panel_Manage_Return`)
                                            .setStyle(ButtonStyle.Primary)
                                            .setEmoji('<:Folder:1092058483848917032>')
                                    )
                            ]
                        })
                    }
                        break;

                    case "8": {
                        await interaction.update({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('Blue')
                                    .setTitle("Panel:")
                                    .setDescription(`
                                        Panel Name: ${data.Type}
                                        Panel Handlers: ${data.Handlers.map((id: any) => { return `<@&${id}>` }).join(", ")}
                                        Panel Category: <#${data.Category}>
                                        Panel Transcript: ${data.Transcripts == "None" ? data.Transcripts : `<#${data.Transcripts}>`}
                                        Panel Button Emoji: ${data.Emoji}
                                        Panel Button Text: ${data.Button}                        
                                    `),
                                new EmbedBuilder()
                                    .setColor('Blue')
                                    .setTitle("Panel Embed Description:")
                                    .setDescription(`${data.Description.substring(0, 3900)}\n\nSelect the channel from the dropdown below to send this panel to a Selected Channel`)
                            ],
                            components: [
                                new ActionRowBuilder<ChannelSelectMenuBuilder | ButtonBuilder>()
                                    .addComponents(
                                        new ChannelSelectMenuBuilder()
                                            .setCustomId(`${interaction.guildId}Panel_Manage_Final_Send`)
                                            .addChannelTypes(ChannelType.GuildText)
                                            .setMinValues(1)
                                            .setMaxValues(1)
                                            .setPlaceholder("Select the channel to send the panel to."),
                                    ),
                                new ActionRowBuilder<ButtonBuilder>()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setLabel("Save & Continue")
                                            .setCustomId(`${interaction.guild?.id}Panel_Manage_Return`)
                                            .setStyle(ButtonStyle.Primary)
                                            .setEmoji('<:Folder:1092058483848917032>')
                                    )
                            ]
                        })
                    }
                        break;

                    case "9": {
                        const name = data.Type
                        await TicketSetup.findOneAndDelete(data)
                        await interaction.update({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor("Green")
                                    .setDescription(`Panel with name \`${name}\` was successfully deleted!\nTo continue, click the button below!`)
                            ],
                            components: [
                                new ActionRowBuilder<ButtonBuilder>()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setCustomId(`${interaction.guildId}Panel_Restart`)
                                            .setStyle(ButtonStyle.Primary)
                                            .setLabel("Continue")
                                            .setEmoji("➡️")
                                    )
                            ]
                        })
                    }
                        break;
                }
            }
                break;
        }
    } else if (interaction.isRoleSelectMenu()) {
        switch (interaction.customId) {
            case `${interaction.guildId}Panel_Manage_RoleSelect_Support`: {
                TicketSetup.findOneAndUpdate({
                    _id: interaction.message.content.replace("Panel ID: ", "") as string
                },
                    {
                        Handlers: interaction.values
                    },
                    {
                        upsert: true
                    })
                await interaction.update({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Blue')
                            .setTitle("Select the support team role(s)")
                            .setDescription(`Members as with such role(s) can moderate tickets, they're automatically added to the tickets.\n\nUse the dropdown menu to select or search the role(s)`),

                        new EmbedBuilder()
                            .setColor('Blue')
                            .setTitle("Support team role(s):")
                            .setDescription(`${interaction.values.map((id: any) => { return `<@&${id}>` }).join(", ")}`)
                    ],
                    components: [
                        new ActionRowBuilder<RoleSelectMenuBuilder>()
                            .addComponents(
                                new RoleSelectMenuBuilder({
                                    custom_id: `${interaction.guildId}Panel_Manage_RoleSelect_Support`,
                                    placeholder: "Select Ticket Managers/Helpers",
                                    type: ComponentType.RoleSelect,
                                    maxValues: 5,
                                    minValues: 1
                                })
                            ),
                        new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                new ButtonBuilder()
                                    .setLabel("Save & Continue")
                                    .setCustomId(`${interaction.guild?.id}Panel_Manage_Return`)
                                    .setStyle(ButtonStyle.Primary)
                                    .setEmoji('<:Folder:1092058483848917032>')
                            )
                    ]
                })
            }
                break;
        }
    } else if (interaction.isChannelSelectMenu()) {
        switch (interaction.customId) {
            case `${interaction.guildId}Panel_Manage_ChannelSelect_Category`: {
                await TicketSetup.findOneAndUpdate({
                    _id: interaction.message.content.replace("Panel ID: ", "") as string
                },
                    {
                        Category: `${interaction.channels.first()?.id}`
                    },
                    {
                        upsert: true
                    })
                await interaction.update({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Blue')
                            .setTitle(`Select ticket category`)
                            .setDescription("Select the category in which the tickets will be created."),

                        new EmbedBuilder()
                            .setColor('Blue')
                            .setTitle("Category")
                            .setDescription(`${interaction.channels.first()}`)
                    ],
                    components: [
                        new ActionRowBuilder<ChannelSelectMenuBuilder>()
                            .addComponents(
                                new ChannelSelectMenuBuilder()
                                    .setChannelTypes(ChannelType.GuildCategory)
                                    .setCustomId(`${interaction.guildId}Panel_Manage_ChannelSelect_Category`)
                                    .setMinValues(1)
                                    .setMaxValues(1)
                                    .setPlaceholder("Select a category")
                            ),
                        new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                new ButtonBuilder()
                                    .setLabel("Save & Continue")
                                    .setCustomId(`${interaction.guild?.id}Panel_Manage_Return`)
                                    .setStyle(ButtonStyle.Primary)
                                    .setEmoji('<:Folder:1092058483848917032>')
                            )
                    ]
                })
            }
                break;

            case `${interaction.guildId}Panel_Manage_ChannelSelect_Transcript`: {
                await TicketSetup.findOneAndUpdate({
                    _id: interaction.message.content.replace("Panel ID: ", "") as string
                },
                    {
                        Transcripts: `${interaction.channels.first()?.id}`
                    },
                    {
                        upsert: true
                    })
                await interaction.update({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Blue')
                            .setTitle("Select the channel to send transcripts into.")
                            .setDescription("Transcript is a document that stores the channel chats!\nThis tool is useful to review tickets even after they're closed.\n\nYou can skip this part of you don't want transripts. "),

                        new EmbedBuilder()
                            .setColor('Blue')
                            .setTitle("Transcript Channel:")
                            .setDescription(`${interaction.channels.first()}`)
                    ],
                    components: [
                        new ActionRowBuilder<ChannelSelectMenuBuilder>()
                            .addComponents(
                                new ChannelSelectMenuBuilder()
                                    .setChannelTypes(ChannelType.GuildText)
                                    .setCustomId(`${interaction.guildId}Panel_Manage_ChannelSelect_Transcript`)
                                    .setMaxValues(1)
                                    .setPlaceholder("Select a channel.")
                            ),
                        new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                new ButtonBuilder()
                                    .setLabel("Save & Continue")
                                    .setCustomId(`${interaction.guild?.id}Panel_Manage_Return`)
                                    .setStyle(ButtonStyle.Primary)
                                    .setEmoji('<:Folder:1092058483848917032>')
                            )
                    ]
                })
            }
                break;

            case `${interaction.guildId}Panel_Manage_Final_Send`: {
                await interaction.deferUpdate()
                const msg = interaction.message as Message
                const channel = interaction.channels.first() as TextChannel
                const id = interaction.message.content.replace("Panel ID: ", "") as string
                const Data = await TicketSetup.findOne({
                    _id: id,
                    GuildID: interaction.guildId
                })
                if (!Data) return interaction.editReply({ message: msg, embeds: [], components: [], content: "This panel was deleted! Please configure a new one." })
                const Embed = new EmbedBuilder()
                    .setColor('Gold')
                    .setAuthor({
                        name: `${interaction.guild?.name}'s Tickets`,
                        iconURL: `${interaction.guild?.iconURL()}`
                    })
                    .setDescription(`${Data.Description || "Click the button below to create a ticket."}`);
                await channel.send({
                    embeds: [Embed],
                    components: [
                        new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`${interaction.guildId}TickeT`)
                                    .setEmoji(Data.Emoji)
                                    .setLabel(Data.Button)
                                    .setStyle(ButtonStyle.Primary)
                            )
                    ]
                })
            }
                break
        }
    } else if (interaction.isModalSubmit()) {
        switch (interaction.customId) {
            case `${interaction.guildId}Panel_Manage_Name_Modal`: {
                await interaction.deferUpdate()
                const name = interaction.fields.getTextInputValue(`${interaction.guildId}Panel_Manage_Name_Modal_Value`)
                await TicketSetup.findOneAndUpdate({
                    _id: interaction.message?.content.replace("Panel ID: ", "") as string
                },
                    {
                        Type: name
                    },
                    {
                        upsert: true
                    })

                await interaction.editReply({
                    message: interaction.message as Message,
                    embeds: [
                        new EmbedBuilder()
                            .setColor("Blue")
                            .setDescription("Rename the panel as you like."),

                        new EmbedBuilder()
                            .setColor("Blurple")
                            .setTitle("Current Name:")
                            .setDescription(`\`${name}\``)
                    ],
                    components: [
                        new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                new ButtonBuilder()
                                    .setStyle(ButtonStyle.Secondary)
                                    .setCustomId(`${interaction.guildId}Panel_Manage_Rename`)
                                    .setLabel("Rename"),

                                new ButtonBuilder()
                                    .setLabel("Save & Continue")
                                    .setCustomId(`${interaction.guild?.id}Panel_Manage_Return`)
                                    .setStyle(ButtonStyle.Primary)
                                    .setEmoji('<:Folder:1092058483848917032>')

                            )
                    ]
                })
            }
                break;

            case `${interaction.guildId}Panel_Manage_Description`: {
                await interaction.deferUpdate()
                const Description1 = interaction.fields.getTextInputValue(`${interaction.guildId}Panel_Manage_Description_Value`) as string
                await TicketSetup.findOneAndUpdate({
                    _id: interaction.message?.content.replace("Panel ID: ", "") as string
                },  
                    {
                        Description: `${Description1.substring(0, 3900)}`
                    },
                    {
                        upsert: true
                    })
                await interaction.editReply({
                    message: interaction.message as Message,
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Blue')
                            .setTitle("Panel Description")
                            .setDescription("This will be displayed within your Panel Embed, you might put general information about your panel. A Panel Description may contain Ticket Guidance as per your choice.\nNote, you might need to use special \"Characters\" to format your description.\n\n**⚠️ Please read this before you get into using this.**\n**1.** To introduce new line, use **{n}** at the end of your sentence.\nExample: \"Hello{n}World\" will be displayed as:\n```\nHello\nWorld\n```\nYou can use many of these together, do not spam it however.\n\n\n**2.** To embed hyperlinks, you can use this format: \`[Any Text](A valid link here)\`.\nExample: \`[Hello World](https://www.youtube.com/watch?v=iik25wqIuFo)\` will be displayed as \"[Hello World](https://www.youtube.com/watch?v=iik25wqIuFo)\""),

                        new EmbedBuilder()
                            .setColor('Yellow')
                            .setTitle("Description:")
                            .setDescription(`${Description1.substring(0, 3900)}`)
                    ],
                    components: [
                        new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`${interaction.guildId}Panel_Manage_Description`)
                                    .setLabel("Description")
                                    .setEmoji("<:Plus:1095034402024718438>")
                                    .setStyle(ButtonStyle.Secondary)
                            ),
                        new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                new ButtonBuilder()
                                    .setLabel("Save & Continue")
                                    .setCustomId(`${interaction.guild?.id}Panel_Manage_Return`)
                                    .setStyle(ButtonStyle.Primary)
                                    .setEmoji('<:Folder:1092058483848917032>')
                            )
                    ]
                })
            }
                break;

            case `${interaction.guildId}Panel_Manage_Button_Emoji_Modal`: {
                await interaction.deferUpdate()
                const E = interaction.fields.getTextInputValue(`${interaction.guildId}Panel_Manage_Button_Emoji_Modal_Value`)
                await TicketSetup.findOneAndUpdate({
                    _id: interaction.message?.content.replace("Panel ID: ", "") as string
                },
                    {
                        Emoji: E
                    },
                    {
                        upsert: true
                    })
                await interaction.editReply({
                    message: interaction.message as Message,
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Blue')
                            .setTitle('Panel Button Emoji')
                            .setDescription("Get your Panel Button a nice Emoji.\nThis will be displayed right next to your Panel Button Name which we will configure in the next step.\n\nExample of how the emoji would look like:")
                            .setImage("https://cdn.discordapp.com/attachments/1093819378044239913/1094893608714387538/image_1.png"),
                        new EmbedBuilder()
                            .setColor('Blue')
                            .setTitle('Emoji:')
                            .setDescription(`Emoji Recieved: \`${E}\``)
                            .setFooter({
                                text: "Default emoji is \"🎫\""
                            })
                    ],
                    components: [
                        new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`${interaction.guildId}Panel_Manage_Button_Emoji`)
                                    .setLabel("Emoji")
                                    .setEmoji("<:Plus:1095034402024718438>")
                                    .setStyle(ButtonStyle.Secondary)
                            ),
                        new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                new ButtonBuilder()
                                    .setLabel("Save & Continue")
                                    .setCustomId(`${interaction.guildId}Panel_Manage_Return`)
                                    .setStyle(ButtonStyle.Primary)
                                    .setEmoji('<:Folder:1092058483848917032>')
                            )
                    ]

                })
            }
                break;

            case `${interaction.guildId}Panel_Manage_Button_Text_Modal`: {
                await interaction.deferUpdate()
                const text = interaction.fields.getTextInputValue(`${interaction.guildId}Panel_Manage_Button_Text_Modal_Value`)
                await TicketSetup.findOneAndUpdate({
                    _id: interaction.message?.content.replace("Panel ID: ", "") as string
                },
                    {
                        Button: text
                    },
                    {
                        upsert: true
                    })
                await interaction.editReply({
                    message: interaction.message as Message,
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Blue')
                            .setTitle("Panel Button Text")
                            .setDescription('Give your Panel Button a nice name.\nThis is will displayed right next to your button emoji which we configured in the last step.\n\nThis is an example of how the Button will look:')
                            .setImage("https://cdn.discordapp.com/attachments/1093819378044239913/1094893608714387538/image_1.png"),
                        new EmbedBuilder()
                            .setColor('Blue')
                            .setTitle('Text:')
                            .setDescription("Text Recieved: `none`")
                            .setFooter({
                                text: "Default Text is \"Ticket\""
                            })
                    ],
                    components: [
                        new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`${interaction.guildId}Panel_Manage_Button_Text`)
                                    .setLabel("Text")
                                    .setEmoji("<:Plus:1095034402024718438>")
                                    .setStyle(ButtonStyle.Secondary)
                            ),
                        new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                new ButtonBuilder()
                                    .setLabel("Save & Continue")
                                    .setCustomId(`${interaction.guild?.id}Panel_Manage_Return`)
                                    .setStyle(ButtonStyle.Primary)
                                    .setEmoji('<:Folder:1092058483848917032>')  
                            )
                    ]
                })
            }
                break;
        }
    }
}