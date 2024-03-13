import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, Interaction, APIRole, Message, ModalBuilder, RoleSelectMenuBuilder, TextInputBuilder, TextInputStyle, ChannelSelectMenuBuilder, ChannelType, Role, parseEmoji, TextChannel, ActionRow, Embed, StringSelectMenuBuilder } from "discord.js";
import { ConfigHandler } from "../../../../../Main-Handler/ConfigHandler";
import TicketSetup from "../../../../models/TicketSetup";
interface ITicketChannel {
    GuildID: string;
    Channel: string;
    Type: string;
    Category: string;
    Transcripts: string;
    Handlers: string[];
    Description: string;
    Button: string;
    Emoji: string;
}
function HasAllTheFieldsButSetupDoneIsSetToFalse(data: any): boolean {
    return !data.SetupDone && !!data.Category && (Array.isArray(data.Handlers) && data.Handlers.length > 0);
}
export default async (instance: ConfigHandler, interaction: Interaction) => {
    let name: string = "Support Tickets"
    if (interaction.isButton()) {
        const CustomIds: string[] = [
            `${interaction.guildId}Panel_Create_Save_0`,
            `${interaction.guildId}Create_Panel`,
            `${interaction.guildId}Name_Panel`,
            `${interaction.guildId}Role_Panel`,
            `${interaction.guildId}Category_Panel`,
            `${interaction.guildId}Channel_Panel`,
            `${interaction.guildId}Panel_Create_Save_1`,
            `${interaction.guildId}Panel_Create_Save_2`,
            `${interaction.guildId}Panel_Create_Save_3`,
            `${interaction.guildId}Panel_Create_Save_4`,
            `${interaction.guildId}Panel_Create_Save_5`,
            `${interaction.guildId}Panel_Create_Save_6`,
            `${interaction.guildId}Panel_Create_Save_7`,
            `${interaction.guildId}Panel_Emoji_Tickets`,
            `${interaction.guildId}Panel_Text_Tickets`,
            `${interaction.guildId}Panel_Description_Tickets`,
            `${interaction.guildId}Panel_Final_Channel`
        ]
        if (!CustomIds.includes(interaction.customId)) return;
        switch (interaction.customId) {
            case `${interaction.guildId}Create_Panel`: {
                const Panels = await TicketSetup.find({
                    GuildID: interaction.guildId
                })
                const isEveryValueTrue: boolean = Panels.map((p) => { return p.SetupDone }).every((val) => val === true)
                if (Panels.length == 3 && isEveryValueTrue == true) {
                    return interaction.update({
                        content: null,
                        embeds: [
                            new EmbedBuilder()
                                .setColor('Red')
                                .setTitle("Brokey Times...")
                                .setDescription("You've created the max panels (**3**) as based on your subscription. You create more panels, you may need to buy premium subscription or just beg the devs they'll give it to you for free, I wish they were so kind like that.")
                        ],
                        components: []
                    })
                } else {
                    const Data = Panels.find((p) => p.SetupDone == false)
                    if (Data) {
                        if (HasAllTheFieldsButSetupDoneIsSetToFalse(Data) == true) {
                            await TicketSetup.findOneAndUpdate({ _id: Data._id }, { SetupDone: true })
                            return interaction.update({
                                embeds: [],
                                components: [],
                                content: `This Panel (${Data._id}) had to be evaluated because all the fields were present but the panel wasn't evaluated before hand.`
                            })
                        }
                        await interaction.update({
                            content: `Panel ID: ${Data._id}`,
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('Yellow')
                                    .setTitle("Alert!")
                                    .setDescription(`We've found an **incomplete** panel of yours. You'll have to complete this panel first before creating a new one!`),

                                new EmbedBuilder()
                                    .setColor('Blue')
                                    .setTitle("Panel Content:")
                                    .setDescription(`
                                Panel Name: ${Data.Type}
                                Panel Handlers: ${Data.Handlers.length == 0 ? "<:Alert:1100715371415224351> Missing Field!" : Data.Handlers.map((id: any) => { return `<@&${id}>` }).join(", ")}
                                Panel Category: ${Data.Category ? `<#${Data.Category}>` : "<:Alert:1100715371415224351> Missing Field!"}
                                Panel Transcript: ${Data.Transcripts == "None" ? Data.Transcripts : `<#${Data.Transcripts}>`}
                                Panel Button Emoji: ${Data.Emoji}
                                Panel Button Text: ${Data.Button}  
        
                                You'll be editing this panel in the next step, you may create a new panel afterwards.
                            `)
                            ],
                            components: [
                                new ActionRowBuilder<ButtonBuilder>()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setStyle(ButtonStyle.Primary)
                                            .setLabel("Next")
                                            .setCustomId(`${interaction.guildId}Panel_Create_Save_0`)
                                    )
                            ]
                        })
                    } else {
                        const data = await TicketSetup.create({
                            GuildID: interaction.guildId,
                            SetupDone: false
                        })
                        await interaction.update({
                            content: `Panel ID: ${data._id}`,
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('Yellow')
                                    .setTitle("Welcome")
                                    .setDescription(`You may begin creating a new panel by clicking the button below!\nNote: The max panels you can create in free subscription of ${interaction.client.user.username} is 3. You may need to upgrade in order to increase the limit to 10.`)
                            ],
                            components: [
                                new ActionRowBuilder<ButtonBuilder>()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setStyle(ButtonStyle.Primary)
                                            .setLabel("Create")
                                            .setCustomId(`${interaction.guildId}Panel_Create_Save_0`)
                                    )
                            ]
                        })
                    }
                }

            }
                break;

            case `${interaction.guildId}Name_Panel`: {
                const Modal = new ModalBuilder()
                    .setCustomId(`${interaction.guildId}Ticket_Panel_Name_Modal`)
                    .setTitle('Set Panel Name')
                    .addComponents(
                        new ActionRowBuilder({
                            components: [
                                new TextInputBuilder()
                                    .setCustomId(`${interaction.guildId}Ticket_Panel_Name_ModalMessage`)
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

            case `${interaction.guildId}Panel_Emoji_Tickets`: {
                const Modal = new ModalBuilder()
                    .setCustomId(`${interaction.guildId}Ticket_Panel_Emoji_Modal`)
                    .setTitle('Set Panel Button Emoji')
                    .addComponents(
                        new ActionRowBuilder({
                            components: [
                                new TextInputBuilder()
                                    .setCustomId(`${interaction.guildId}Ticket_Panel_Emoji_ModalMessage`)
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

            case `${interaction.guildId}Panel_Text_Tickets`: {
                const Modal = new ModalBuilder()
                    .setCustomId(`${interaction.guildId}Ticket_Panel_Text_Modal`)
                    .setTitle('Set Panel Button Name')
                    .addComponents(
                        new ActionRowBuilder({
                            components: [
                                new TextInputBuilder()
                                    .setCustomId(`${interaction.guildId}Ticket_Panel_Text_ModalMessage`)
                                    .setLabel('Name')
                                    .setValue('Ticket')
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

            case `${interaction.guildId}Panel_Description_Tickets`: {
                const Modal = new ModalBuilder()
                    .setCustomId(`${interaction.guildId}Ticket_Panel_Description_Modal`)
                    .setTitle('Set Panel Embed Description')
                    .addComponents(
                        new ActionRowBuilder({
                            components: [
                                new TextInputBuilder()
                                    .setCustomId(`${interaction.guildId}Ticket_Panel_Description_ModalMessage`)
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

            case `${interaction.guildId}Panel_Create_Save_0`: {
                await interaction.update({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Blue')
                            .setTitle("Step 1/8: Add Panel Name!")
                            .setDescription("Give your panel a nice name, this will be your panel type.\n\nThe tickets so created will have the type name."),

                        new EmbedBuilder()
                            .setColor('Blue')
                            .setDescription(`Panel name: \`${name}\``)
                    ],
                    components: [
                        new ActionRowBuilder<ButtonBuilder>().addComponents(
                            new ButtonBuilder()
                                .setLabel("Panel Name")
                                .setCustomId(`${interaction.guild?.id}Name_Panel`)
                                .setStyle(ButtonStyle.Secondary)
                                .setEmoji('📝'),

                            new ButtonBuilder()
                                .setLabel("Save & Continue")
                                .setCustomId(`${interaction.guild?.id}Panel_Create_Save_1`)
                                .setStyle(ButtonStyle.Primary)
                                .setEmoji('<:Folder:1092058483848917032>')
                        )
                    ]

                })
            }
                break;

            case `${interaction.guildId}Panel_Create_Save_1`: {
                await interaction.update({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Blue')
                            .setTitle("Step 2/8: Select the support team role(s)")
                            .setDescription(`Members as with such role(s) can moderate tickets, they're automatically added to the tickets.\n\nUse the dropdown menu to select or search the role(s)`),

                        new EmbedBuilder()
                            .setColor('Blue')
                            .setTitle("Support team role(s):")
                            .setDescription(`\`None\``)
                    ],
                    components: [
                        new ActionRowBuilder<RoleSelectMenuBuilder>()
                            .addComponents(
                                new RoleSelectMenuBuilder({
                                    custom_id: `${interaction.guildId}_Role_Select_Menu_Tickets`,
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
                                    .setCustomId(`${interaction.guild?.id}Panel_Create_Save_2`)
                                    .setStyle(ButtonStyle.Primary)
                                    .setEmoji('<:Folder:1092058483848917032>')
                            )
                    ]
                })
            }
                break;

            case `${interaction.guildId}Panel_Create_Save_2`: {
                await interaction.update({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Blue')
                            .setTitle(`Step 3/8: Select ticket category`)
                            .setDescription("Select the category in which the tickets will be created."),

                        new EmbedBuilder()
                            .setColor('Blue')
                            .setTitle("Category")
                            .setDescription("\`none\`")
                    ],
                    components: [
                        new ActionRowBuilder<ChannelSelectMenuBuilder>()
                            .addComponents(
                                new ChannelSelectMenuBuilder()
                                    .setChannelTypes(ChannelType.GuildCategory)
                                    .setCustomId(`${interaction.guildId}_Category_Select_Menu_Tickets`)
                                    .setMinValues(1)
                                    .setMaxValues(1)
                                    .setPlaceholder("Select a category")
                            ),
                        new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                new ButtonBuilder()
                                    .setLabel("Save & Continue")
                                    .setCustomId(`${interaction.guild?.id}Panel_Create_Save_3`)
                                    .setStyle(ButtonStyle.Primary)
                                    .setEmoji('<:Folder:1092058483848917032>')
                            )
                    ]
                })
            }
                break;

            case `${interaction.guildId}Panel_Create_Save_3`: {
                await interaction.update({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Blue')
                            .setTitle('Step 4/8: Panel Button Emoji')
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
                                    .setCustomId(`${interaction.guildId}Panel_Emoji_Tickets`)
                                    .setLabel("Emoji")
                                    .setEmoji("<:Plus:1095034402024718438>")
                                    .setStyle(ButtonStyle.Secondary)
                            ),
                        new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                new ButtonBuilder()
                                    .setLabel("Save & Continue")
                                    .setCustomId(`${interaction.guild?.id}Panel_Create_Save_4`)
                                    .setStyle(ButtonStyle.Primary)
                                    .setEmoji('<:Folder:1092058483848917032>')
                            )
                    ]

                })
            }
                break;

            case `${interaction.guildId}Panel_Create_Save_4`: {
                await interaction.update({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Blue')
                            .setTitle("Step 5/8: Panel Button Text")
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
                                    .setCustomId(`${interaction.guildId}Panel_Text_Tickets`)
                                    .setLabel("Text")
                                    .setEmoji("<:Plus:1095034402024718438>")
                                    .setStyle(ButtonStyle.Secondary)
                            ),
                        new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                new ButtonBuilder()
                                    .setLabel("Save & Continue")
                                    .setCustomId(`${interaction.guild?.id}Panel_Create_Save_5`)
                                    .setStyle(ButtonStyle.Primary)
                                    .setEmoji('<:Folder:1092058483848917032>')
                            )
                    ]
                })
            }
                break;

            case `${interaction.guildId}Panel_Create_Save_5`: {
                await interaction.update({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Blue')
                            .setTitle("Step 6/8: Panel Description")
                            .setDescription("This will be displayed within your Panel Embed, you might put general information about your panel. A Panel Description may contain Ticket Guidance as per your choice.\nNote, you might need to use special \"Characters\" to format your description.\n\n**⚠️ Please read this before you get into using this.**\n**1.** To introduce new line, use **{n}** at the end of your sentence.\nExample: \"Hello{n}World\" will be displayed as:\n```\nHello\nWorld\n```\nYou can use many of these together, do not spam it however.\n\n\n**2.** To embed hyperlinks, you can use this format: \`[Any Text](A valid link here)\`.\nExample: \`[Hello World](https://www.youtube.com/watch?v=iik25wqIuFo)\` will be displayed as \"[Hello World](https://www.youtube.com/watch?v=iik25wqIuFo)\"")
                    ],
                    components: [
                        new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`${interaction.guildId}Panel_Description_Tickets`)
                                    .setLabel("Description")
                                    .setEmoji("<:Plus:1095034402024718438>")
                                    .setStyle(ButtonStyle.Secondary)
                            ),
                        new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                new ButtonBuilder()
                                    .setLabel("Save & Continue")
                                    .setCustomId(`${interaction.guild?.id}Panel_Create_Save_6`)
                                    .setStyle(ButtonStyle.Primary)
                                    .setEmoji('<:Folder:1092058483848917032>')
                            )
                    ]
                })
            }
                break;

            case `${interaction.guildId}Panel_Create_Save_6`: {
                await interaction.update({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Blue')
                            .setTitle("Step 7/8 Select the channel to send transcripts into.")
                            .setDescription("Transcript is a document that stores the channel chats!\nThis tool is useful to review tickets even after they're closed.\n\nYou can skip this part of you don't want transripts. "),

                        new EmbedBuilder()
                            .setColor('Blue')
                            .setTitle("Transcript Channel:")
                            .setDescription("\`none\`")
                    ],
                    components: [
                        new ActionRowBuilder<ChannelSelectMenuBuilder>()
                            .addComponents(
                                new ChannelSelectMenuBuilder()
                                    .setChannelTypes(ChannelType.GuildText)
                                    .setCustomId(`${interaction.guildId}_Transcript_Select_Menu_Tickets`)
                                    .setMaxValues(1)
                                    .setPlaceholder("Select a channel.")
                            ),
                        new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                new ButtonBuilder()
                                    .setLabel("Save & Continue")
                                    .setCustomId(`${interaction.guild?.id}Panel_Create_Save_7`)
                                    .setStyle(ButtonStyle.Primary)
                                    .setEmoji('<:Folder:1092058483848917032>')
                            )
                    ]
                })
            }
                break;

            case `${interaction.guildId}Panel_Create_Save_7`: {
                const id = interaction.message.content.replace("Panel ID: ", "") as string
                await interaction.update({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Blue')
                            .setDescription("Evaluating your response <a:Load:1095406925782458369>")
                    ],
                    components: []
                })
                const Data = await TicketSetup.findOne({
                    _id: id,
                    GuildID: interaction.guildId
                })
                const msg = interaction.message as Message
                if (!Data) return interaction.editReply({
                    message: msg,
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Blue')
                            .setDescription("Invalid Panel!\nThis panel has been deleted by a moderator recently")
                    ]
                })
                const requiredFields: (keyof ITicketChannel)[] = [
                    'Type',
                    'Category',
                    'Transcripts',
                    'Handlers',
                    'Description',
                    'Button',
                    'Emoji',
                ];
                const missingFields = requiredFields.filter(field =>
                    Data[field] === undefined || Data[field] === null ||
                    (Array.isArray(Data[field]) && Data[field].length === 0)
                );
                if (missingFields.length === 0) {
                    Data.SetupDone = true
                    await Data.save()
                    await interaction.editReply({
                        message: msg,
                        embeds: [
                            new EmbedBuilder()
                                .setColor('Blue')
                                .setTitle("Setup Complete!")
                                .setDescription(`
                                    Panel Name: ${Data.Type}
                                    Panel Handlers: ${Data.Handlers.map((id: any) => { return `<@&${id}>` }).join(", ")}
                                    Panel Category: <#${Data.Category}>
                                    Panel Transcript: ${Data.Transcripts == "None" ? Data.Transcripts : `<#${Data.Transcripts}>`}
                                    Panel Button Emoji: ${Data.Emoji}
                                    Panel Button Text: ${Data.Button}                        
                                `),
                            new EmbedBuilder()
                                .setColor('Blue')
                                .setTitle("Panel Embed Description:")
                                .setDescription(`${Data.Description.substring(0, 3900)}\n\nSelect the channel from the dropdown below to send this panel to a Selected Channel`)
                        ],
                        components: [
                            new ActionRowBuilder<ChannelSelectMenuBuilder>()
                                .addComponents(
                                    new ChannelSelectMenuBuilder()
                                        .setCustomId(`${interaction.guildId}Panel_Final_Channel`)
                                        .addChannelTypes(ChannelType.GuildText)
                                        .setMinValues(1)
                                        .setMaxValues(1)
                                        .setPlaceholder("Select the channel to send the panel to.")
                                )
                        ]
                    })
                } else {
                    await interaction.editReply({
                        message: msg,
                        content: "You will not be able to Setup another Panel if you don't finish this!",
                        embeds: [
                            new EmbedBuilder()
                                .setColor('Blurple')
                                .setTitle("Missing fields!")
                                .setDescription(`We don't have any information regarding these fields:\n${missingFields.join("\n").replace("Type", "Panel Name").replace("Handlers", "Support Role(s)").replace("Category", "Ticket Category")}`)
                        ]
                    })
                }

            }
                break;
        }

    } else if (interaction.isModalSubmit()) {
        switch (interaction.customId) {
            case `${interaction.guildId}Ticket_Panel_Name_Modal`: {
                await interaction.deferUpdate()
                const msg = interaction.message as Message
                name = interaction.fields.getTextInputValue(`${interaction.guildId}Ticket_Panel_Name_ModalMessage`)
                const data = await TicketSetup.findOneAndUpdate({
                    _id: msg.content.replace('Panel ID: ', ''),
                    GuildID: interaction.guildId
                },
                    {
                        GuildID: interaction.guildId,
                        Type: name,
                        SetupDone: false
                    })
                const message = interaction.message as Message
                await interaction.editReply({
                    message: message,
                    content: `Panel ID: ${data._id}`,
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Blue')
                            .setTitle("Step 1/8: Add Panel Name!")
                            .setDescription("Give your panel a nice name, this will be your panel type.\n\nThe tickets so created will have the type name."),

                        new EmbedBuilder()
                            .setColor('Blue')
                            .setDescription(`Panel name: \`${name}\``)
                    ]
                })
            }
                break;

            case `${interaction.guildId}Ticket_Panel_Emoji_Modal`: {
                await interaction.deferUpdate()
                let Recieved = interaction.fields.getTextInputValue(`${interaction.guildId}Ticket_Panel_Emoji_ModalMessage`)
                Recieved = [...Recieved][0]
                const Emoji = parseEmoji(Recieved)
                const msg = interaction.message as Message
                const DefaultEmojiCheck = /^[\u{1F000}-\u{1FFFF}]|^[\u{2600}-\u{27BF}]|^[\u{1F300}-\u{1F5FF}]|^[\u{1F900}-\u{1F9FF}]|^[\u{1F600}-\u{1F64F}]|^[\u{1F680}-\u{1F6FF}]|^[\u{1F170}-\u{1F251}]$/u
                if ((Emoji?.id) || (Emoji?.id === undefined && DefaultEmojiCheck.test(Recieved) == true)) {
                    await TicketSetup.findOneAndUpdate({
                        _id: msg.content.replace('Panel ID: ', ''),
                        GuildID: interaction.guildId
                    },
                        {
                            GuildID: interaction.guildId,
                            Emoji: `${Recieved}`,
                            SetupDone: false
                        });

                    await interaction.editReply({
                        message: msg,
                        embeds: [
                            new EmbedBuilder()
                                .setColor('Blue')
                                .setTitle('Step 4/8: Panel Button Emoji')
                                .setDescription("Get your Panel Button a nice Emoji.\nThis will be displayed right next to your Panel Button Name which we will configure in the next step.\n\nExample of how the emoji would look like:")
                                .setImage("https://cdn.discordapp.com/attachments/1093819378044239913/1094893608714387538/image_1.png"),
                            new EmbedBuilder()
                                .setColor('Blue')
                                .setTitle('Emoji:')
                                .setDescription(`Emoji Recieved: "${Recieved}"`)
                                .setFooter({
                                    text: "Default emoji is \"🎫\""
                                })
                        ],
                    })
                } else {
                    await interaction.channel?.send(`${interaction.user} Invalid Emoji! You cannot provide custom emojis due to safety reasons.`).then((msg) => {
                        setTimeout(() => {
                            msg.deletable ? msg.delete() : msg;
                        }, 4000);
                    })
                    return;
                }
            }
                break;

            case `${interaction.guildId}Ticket_Panel_Text_Modal`: {
                await interaction.deferUpdate()
                const Recieved = interaction.fields.getTextInputValue(`${interaction.guildId}Ticket_Panel_Text_ModalMessage`)
                const msg = interaction.message as Message
                if (/^[a-zA-Z]+$/.test(Recieved)) {
                    await TicketSetup.findOneAndUpdate({
                        _id: msg.content.replace('Panel ID: ', ''),
                        GuildID: interaction.guildId
                    },
                        {
                            GuildID: interaction.guildId,
                            Button: `${Recieved}`,
                            SetupDone: false
                        });

                    await interaction.editReply({
                        message: msg,
                        embeds: [
                            new EmbedBuilder()
                                .setColor('Blue')
                                .setTitle("Step 5/8: Panel Button Text")
                                .setDescription('Give your Panel Button a nice name.\nThis is will displayed right next to your button emoji which we configured in the last step.\n\nThis is an example of how the Button will look:')
                                .setImage("https://cdn.discordapp.com/attachments/1093819378044239913/1094893608714387538/image_1.png"),
                            new EmbedBuilder()
                                .setColor('Blue')
                                .setTitle('Text:')
                                .setDescription(`Text Recieved: \`${Recieved}\``)
                                .setFooter({
                                    text: "Default Text is \"Ticket\""
                                })
                        ]
                    });

                } else {
                    await interaction.channel?.send(`${interaction.user} Text shall not contain any emojis or any special characters!\nMake sure you leave no space b/w two consecutive words.`).then((msg) => {
                        setTimeout(() => {
                            msg.deletable ? msg.delete() : msg;
                        }, 4000);
                    })
                    return;
                }

            }
                break;

            case `${interaction.guildId}Ticket_Panel_Description_Modal`: {
                await interaction.deferUpdate()
                let Recieved = interaction.fields.getTextInputValue(`${interaction.guildId}Ticket_Panel_Description_ModalMessage`).replace(/{n}/g, "\n")
                const msg = interaction.message as Message
                await TicketSetup.findOneAndUpdate({
                    _id: msg.content.replace('Panel ID: ', ''),
                    GuildID: interaction.guildId
                },
                    {
                        GuildID: interaction.guildId,
                        Description: Recieved,
                        SetupDone: false
                    });
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Blue')
                            .setTitle("Step 6/8: Panel Description")
                            .setDescription("This will be displayed within your Panel Embed, you might put general information about your panel. A Panel Description may contain Ticket Guidance as per your choice.\nNote, you might need to use special \"Characters\" to format your description.\n\n**⚠️ Please read this before you get into using this.**\n**1.** To introduce new line, use **{n}** at the end of your sentence.\nExample: \"Hello{n}World\" will be displayed as:\n```\nHello\nWorld\n```\nYou can use many of these together, do not spam it however.\n\n\n**2.** To embed hyperlinks, you can use this format: \`[Any Text](A valid link here)\`.\nExample: \`[Hello World](https://www.youtube.com/watch?v=iik25wqIuFo)\` will be displayed as \"[Hello World](https://www.youtube.com/watch?v=iik25wqIuFo)\""),

                        new EmbedBuilder()
                            .setColor('Orange')
                            .setTitle("Your Panel Embed Description:")
                            .setDescription(Recieved)
                    ]
                })
            }
                break;
        }
    } else if (interaction.isRoleSelectMenu()) {
        if (interaction.customId !== `${interaction.guildId}_Role_Select_Menu_Tickets`) return;
        await interaction.deferUpdate()
        const map = interaction.roles.map((r: Role | APIRole) => {
            return `${r.id}`
        })
        const map2 = interaction.roles.reverse().map((r: Role | APIRole) => {
            return `${r}`
        })
        const msg = interaction.message as Message
        await TicketSetup.findOneAndUpdate({
            _id: msg.content.replace('Panel ID: ', ''),
            GuildID: interaction.guildId
        },
            {
                GuildID: interaction.guildId,
                Handlers: map,
                SetupDone: false
            })
        await interaction.editReply({
            message: interaction.message,
            embeds: [
                new EmbedBuilder()
                    .setColor('Blue')
                    .setTitle("Step 2/8: Select the support team role(s)")
                    .setDescription(`Members as with such role(s) can moderate tickets, they're automatically added to the tickets.\n\nUse the dropdown menu to select or search the role(s)`),

                new EmbedBuilder()
                    .setColor('Blue')
                    .setTitle('Support team role(s):')
                    .setDescription(`${map2.join("\n")}`)
            ]
        })
    } else if (interaction.isChannelSelectMenu()) {
        switch (interaction.customId) {
            case `${interaction.guildId}_Category_Select_Menu_Tickets`: {
                const msg = interaction.message as Message
                await interaction.deferUpdate()
                await TicketSetup.findOneAndUpdate({
                    _id: msg.content.replace('Panel ID: ', ''),
                    GuildID: interaction.guildId
                },
                    {
                        GuildID: interaction.guildId,
                        Category: interaction.channels.first()!.id,
                        SetupDone: false
                    })
                await interaction.editReply({
                    message: interaction.message,
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Blue')
                            .setTitle(`Step 3/8: Select ticket category`)
                            .setDescription("Select the category in which the tickets will be created."),

                        new EmbedBuilder()
                            .setColor('Blue')
                            .setTitle("Category")
                            .setDescription(`${interaction.channels.first()}`)
                    ]
                })
            }
                break;

            case `${interaction.guildId}_Transcript_Select_Menu_Tickets`: {
                await interaction.deferUpdate()
                const msg = interaction.message as Message
                await TicketSetup.findOneAndUpdate({
                    _id: msg.content.replace('Panel ID: ', ''),
                    GuildID: interaction.guildId
                },
                    {
                        GuildID: interaction.guildId,
                        Transcripts: interaction.channels.first()!.id,
                        SetupDone: false
                    })
                await interaction.editReply({
                    message: interaction.message,
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Blue')
                            .setTitle("Step 7/8: Select the channel to transcripts into.")
                            .setDescription("Transcript is a document that stores the channel chats!\nThis tool is useful to review tickets even after they're closed.\n\nYou can skip this part of you don't want transripts. "),

                        new EmbedBuilder()
                            .setColor('Blue')
                            .setTitle("Transcript Channel:")
                            .setDescription(`${interaction.channels.first()}`)
                    ],
                })
            }
                break;

            case `${interaction.guildId}Panel_Final_Channel`: {
                await interaction.deferUpdate()
                const channel = interaction.channels.first() as TextChannel
                const msg = interaction.message as Message
                const Data = await TicketSetup.findOne({
                    _id: interaction.message.content.replace("Panel ID: ", ""),
                    GuildID: interaction.guildId
                })
                if (!Data) return interaction.editReply({ message: msg, embeds: [], components: [], content: "This panel was deleted! Please configure a new one." })
                const Embed = new EmbedBuilder()
                    .setColor('Gold')
                    .setAuthor({
                        name: `${interaction.guild?.name}'s Tickets`,
                        iconURL: `${interaction.guild?.iconURL()}`
                    })
                    .setDescription(`${Data.Description}`);
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
                break;
        }
    }
}