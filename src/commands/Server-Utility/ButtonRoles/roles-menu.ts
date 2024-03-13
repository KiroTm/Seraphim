import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, Guild, Interaction, PermissionFlagsBits, Role, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextChannel, User } from "discord.js";
import { CommandType } from "../../../../Main-Handler/ConfigHandler";
import ButtonRoleSchema from "../../../Models/ButtonRoles-schema";
import { Callback, Command } from "../../../../typings";
async function panelRow(array: Array<any>, Num: number, guild: Guild) {
    const Rows: Array<ActionRowBuilder<ButtonBuilder>> = [];
    let k = Num
    for (let i = 0; i < array.length; i += Num) {
        const current = array.slice(i, k)
        k += Num

        let TotalArray: Array<any> = [];
        const info = current.map((x) => {
            const role = guild.roles.cache.get(x.RoleID) as Role
            return new ButtonBuilder().setStyle(ButtonStyle.Success).setCustomId(role.id).setEmoji(x.RoleEmoji).setLabel(role.name)
        })
        TotalArray.push(info)
        TotalArray.forEach((x) => {
            const Row = new ActionRowBuilder<ButtonBuilder>().addComponents(x)
            Rows.push(Row)
        })
    }
    return Rows
}
export default {
    name: "roles-menu",
    description: 'Roles Panel',
    type: CommandType.slash,
    permissions: [PermissionFlagsBits.Administrator],
    options: [
        {
            name: "create",
            description: "Create a new panel for this server",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "name",
                    description: "Give your panel a nice name",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: "description",
                    description: "Write something about your cool role panel",
                    type: ApplicationCommandOptionType.String,
                    required: false
                },
                {
                    name: "role",
                    description: "Select a role that,only the members with such role will be able to use this panel.",
                    type: ApplicationCommandOptionType.Role,
                    required: false
                }
            ]
        },
        {
            name: "delete",
            description: "Delete a role panel.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "panel-id",
                    description: "Check out the panel id and type it in here",
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
        {
            name: "list",
            description: "View your overall role panel for this server",
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: "add",
            description: "Add roles to an existing panel",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "panel-id",
                    description: "Check out the panel id and type it in here",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: "role",
                    description: "The role to add/remove on button click",
                    type: ApplicationCommandOptionType.Role,
                    required: true
                },
                {
                    name: "emoji",
                    description: "An emoji of your choice!",
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
        {
            name: "remove",
            description: "Remove a button role from an existing panel",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "panel-id",
                    description: "Check out the panel id and type it in here",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: "role",
                    description: "Select the role to be removed",
                    type: ApplicationCommandOptionType.Role,
                    required: true
                }
            ]
        },
        {
            name: "panel",
            description: "Sends a panel in the provided channel",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "panel-id",
                    description: "Enter the panel id here",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: "channel",
                    description: "Choose a channel to send this pannel to",
                    type: ApplicationCommandOptionType.Channel,
                    channelTypes: [ChannelType.GuildText],
                    required: false
                }
            ]
        },
        {
            name: "view",
            description: "View a particular panel",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "panel-id",
                    description: "Enter the panel id here",
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
        {
            name: "edit",
            description: "Manage existing panel data",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "panel-id",
                    description: "Enter the panel id here",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: "option-number",
                    description: "Type in the panel option number to edit",
                    type: ApplicationCommandOptionType.Number,
                    required: true,
                    minValue: 1,
                    maxValue: 25
                },
                {
                    name: "emoji",
                    description: "Enter the emoji here",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: "role",
                    description: "Select the role",
                    type: ApplicationCommandOptionType.Role,
                    required: true
                },
                {
                    name: "re-arrange",
                    description: "Re-arrange the panel roles",
                    type: ApplicationCommandOptionType.Boolean,
                    required: false,
                }
            ]
        },
        {
            name: "guide",
            description: "Get to know everything about this command",
            type: ApplicationCommandOptionType.Subcommand
        }
    ],
    callback: async ({ interaction }: Callback) => {
        if (interaction) {
            if (interaction.isChatInputCommand()) {
                if (!interaction || !interaction.isChatInputCommand()) return;

                await interaction.deferReply();
                const options = interaction.options;
                const guild = interaction.guild as Guild;
                const user = interaction.user as User;
                const channel = interaction.channel as TextChannel;

                switch (options.getSubcommand()) {
                    case "create": {
                        const name = `${options.getString('name')}`.toLowerCase();
                        const description = options.getString('description') || "Get your roles from here!";
                        const role = options.getRole("role") as Role || (guild.roles.everyone as Role);

                        const data = new ButtonRoleSchema({
                            GuildId: guild.id,
                            UserId: user.id,
                            Description: description,
                            Role: role ? role.id : undefined,
                            Name: name
                        });

                        data.save();

                        await interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('Blue')
                                    .setDescription(`A new Roles Panel has been created!\nPannel Name: ${name.toUpperCase()}\nCreated By: ${user}\nDescription:${description}`)
                            ]
                        });
                    }
                        break;

                    case "list": {
                        const panelList = await ButtonRoleSchema.find({
                            GuildId: guild.id
                        });

                        if (!panelList.length) {
                            await interaction.editReply({ embeds: [new EmbedBuilder().setColor('Red').setDescription("Start creating Role panels and they will show here")] });
                        } else {
                            let index = 1;
                            const panelData = panelList.map((d) => {
                                let Role;
                                if (d.Role) Role = guild.roles.cache.get(d.Role);
                                else Role = "None";
                                return `**${index++}.** **${d.Name.toUpperCase()}**\n**ID: ${d._id}**\n**Required Roles:** ${Role}`;
                            }).join("\n\n");

                            const embed = new EmbedBuilder().setColor('Blue').setDescription(`${panelData}`).setFooter({ text: "Button Roles!" });
                            if (guild.iconURL()) embed.setAuthor({ iconURL: guild.iconURL({ forceStatic: false }) as string, name: guild.name as string });

                            await interaction.editReply({
                                embeds: [embed]
                            });
                        }
                    }
                        break;
                    case "delete": {
                        const panelID = options.getString('panel-id')
                        const guildData = await ButtonRoleSchema.findOne({ _id: panelID });
                        if (!guildData) return await interaction.editReply({ embeds: [new EmbedBuilder().setColor('Red').setDescription("Invalid Panel-ID!")] });
                        if (guild.id !== guildData.GuildId) return await interaction.editReply({ embeds: [new EmbedBuilder().setColor('Red').setDescription("Invalid Panel-ID!")] });
                        ButtonRoleSchema.deleteOne(guildData)
                        await interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('Blue')
                                    .setDescription(`Deleted role-panel with ID: \`${panelID}\``)
                            ]
                        })
                    }
                        break;
                    case "add": {
                        const panelId = options.getString('panel-id')
                        const role = options.getRole('role') as Role
                        const emoji = options.getString('emoji') || "⚪"
                        const guildData = await ButtonRoleSchema.findOne({ _id: panelId })
                        if (!guildData) return await interaction.editReply({ embeds: [new EmbedBuilder().setColor('Red').setDescription("Invalid Panel-ID!")] });
                        if (guild.id !== guildData.GuildId) return await interaction.editReply({ embeds: [new EmbedBuilder().setColor('Red').setDescription("Invalid Panel-ID!")] });
                        if (guildData.Roles.length >= 25) return await interaction.editReply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('You cannot add more than 24 buttons in one role panel!')] })
                        if (role.position >= parseInt(`${guild.members.me?.roles.highest.position}`)) return await interaction.editReply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('I cannot add that role since that role in above mine, drag my role above the role')] })
                        const newRole = {
                            RoleID: role.id,
                            RoleEmoji: emoji
                        }
                        if (guildData) {
                            let roleData = guildData.Roles.find((r: any) => r.RoleID === role.id)
                            if (roleData) {
                                roleData = newRole
                            } else {
                                guildData.Roles = [...guildData.Roles, newRole]
                            }
                            guildData.save()
                        } else {
                            ButtonRoleSchema.create({
                                GuildId: guild.id,
                                Roles: newRole
                            })
                        }
                        await interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('Blue')
                                    .setTitle("Changes Saved!")
                                    .setDescription(`
                                    Panel Name: ${guildData.Name.toUpperCase()}
                                    Role: ${role}
                                    Emoji: ${emoji}
                                `)
                                    .setTimestamp()
                            ]
                        })
                    }
                        break;
                    case "remove": {
                        const panelId = options.getString('panel-id')
                        const role = options.getRole('role') as Role
                        const guildData = await ButtonRoleSchema.findOne({ _id: panelId })
                        if (!guildData) return await interaction.editReply({ embeds: [new EmbedBuilder().setColor('Red').setDescription("Invalid Panel-ID!")] });
                        if (guild.id !== guildData.GuildId) return await interaction.editReply({ embeds: [new EmbedBuilder().setColor('Red').setDescription("Invalid Panel-ID!")] });
                        const guildRoles = guildData.Roles
                        const findRole = guildRoles.find((r: any) => r.RoleID === role.id)
                        if (!findRole) return await interaction.editReply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('Invalid role!')] })
                        const filteredRoles = guildRoles.filter((r: any) => r.RoleID !== role.id)
                        guildData.Roles = filteredRoles
                        guildData.save()
                        await interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('Blue')
                                    .setDescription(`Successfully removed ${role} from the roles panel!`)
                            ]
                        })
                    }
                        break;
                    case "panel": {
                        const panelID = options.getString('panel-id')
                        const Channel = options.getChannel('channel') as TextChannel || channel as TextChannel
                        const guildData = await ButtonRoleSchema.findOne({ _id: panelID })
                        if (!guildData) return await interaction.editReply({ embeds: [new EmbedBuilder().setColor('Red').setDescription("Invalid Panel-ID!")] });
                        if (guild.id !== guildData.GuildId) return await interaction.editReply({ embeds: [new EmbedBuilder().setColor('Red').setDescription("Invalid Panel-ID!")] });
                        if (!guildData.Roles) return await interaction.editReply({ embeds: [new EmbedBuilder().setColor('Red').setDescription("Can't find any role data!")] })
                        const Description = guildData.Roles.map((x: any) => {
                            const role = guild.roles.cache.get(x.RoleID) as Role
                            return `Click on ${x.RoleEmoji} to get the ${role} role`
                        }).join("\n\n")
                        try {
                            const row = await panelRow(guildData.Roles, 5, guild)
                            await Channel.send({
                                embeds: [
                                    new EmbedBuilder()
                                        .setColor("Blue")
                                        .setTitle(`${guildData.Name.toUpperCase()}`)
                                        .setDescription(`${guildData.Description}\n\n${Description}`)
                                        .setThumbnail(guild.iconURL({ forceStatic: false }))
                                ],
                                components: row
                            }).catch(async () => {
                                return await interaction.editReply({
                                    embeds: [
                                        new EmbedBuilder()
                                            .setColor('Red')
                                            .setDescription('Cannot send panel to that channel!')
                                    ]
                                })
                            })
                            await interaction.editReply({
                                embeds: [
                                    new EmbedBuilder()
                                        .setColor('Blue')
                                        .setDescription(`Panel sent to ${Channel}`)
                                ]
                            })
                        } catch (err) {
                            return await interaction.editReply({
                                embeds: [
                                    new EmbedBuilder()
                                        .setColor('Red')
                                        .setDescription("That panel contains role(s) that are deleted from this server. Kindly check the roles again!")
                                ]
                            })
                        }

                    }
                        break;
                    case "view": {
                        const panelId = options.getString('panel-id')
                        const panelList = await ButtonRoleSchema.findOne({
                            _id: panelId,
                            GuildId: guild.id,
                        })
                        if (!panelList) return await interaction.editReply({ embeds: [new EmbedBuilder().setColor('Red').setDescription("Invalid Panel-ID!")] })
                        const RolesArr = [...panelList.Roles]
                        if (!RolesArr.length) return await interaction.editReply({ embeds: [new EmbedBuilder().setColor('Red').setDescription("There are no roles for this panel")] })
                        let index = 1
                        const MappedData: string[] = [];
                        RolesArr.forEach((r) => {
                            const role = guild.roles.cache.get(r.RoleID) as Role
                            return MappedData.push(`**${index++}.** ${r.RoleEmoji || "This role has been deleted!"} → ${role}`)
                        })
                        await interaction.editReply({
                            content: `TIP: you can use </${interaction.commandName} edit:${interaction.id}> to manage panel data. Useful in removing panel options with deleted roles.`,
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('Blue')
                                    .setDescription(`Panel - \`${panelId}\`\n\n${MappedData.join("\n\n")}`)
                            ]
                        })
                    }
                        break;
                    case "edit": {
                        const panelId = options.getString('panel-id')
                        const number = options.getNumber('option-number') as number - 1
                        const emoji = options.getString('emoji') as String
                        const role = options.getRole('role') as Role
                        const rearrange = options.getBoolean('re-arrange') as boolean || false
                        const panelData = await ButtonRoleSchema.findOne({
                            _id: panelId,
                            GuildId: guild.id,
                        })
                        if (!panelData) return await interaction.editReply({ embeds: [new EmbedBuilder().setColor('Red').setDescription("Invalid Panel-ID!")] })
                        const RolesArr = [...panelData.Roles]
                        if (!RolesArr.length) return await interaction.editReply({ embeds: [new EmbedBuilder().setColor('Red').setDescription("There are no roles for this panel")] })
                        if (!RolesArr[number]) return await interaction.editReply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('There is no such option in this panel')] })
                        if (role.position >= parseInt(`${guild.members.me?.roles.highest.position}`)) return await interaction.editReply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('I cannot add that role since that role in above mine, drag my role above the role')] })
                        const newRole = {
                            RoleID: role.id,
                            RoleEmoji: emoji
                        }
                        panelData.Roles[number] = newRole
                        await panelData.save()
                        const panelData2 = await ButtonRoleSchema.findOne({
                            _id: panelId,
                            GuildId: guild.id,
                        })
                        const RolesArr2 = [...panelData2.Roles]
                        rearrange === true ? RolesArr2.sort() : RolesArr2
                        let index = 1
                        const MappedData: string[] = [];
                        RolesArr2.forEach((r) => {
                            const role = guild.roles.cache.get(r.RoleID) as Role
                            return MappedData.push(`**${index++}.** ${r.RoleEmoji || "This role has been deleted!"} → ${role}`)
                        });
                        await interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('Blue')
                                    .setDescription(`**Panel Updated!**\nNew Panel:\n${MappedData.join("\n\n")}`)
                            ]
                        })
                    }
                        break;
                    case "guide": {
                        const row = new ActionRowBuilder<StringSelectMenuBuilder>()
                            .addComponents(
                                new StringSelectMenuBuilder()
                                    .setCustomId(`${interaction.id}guide`)
                                    .setPlaceholder("Select one")
                                    .setMinValues(1)
                                    .setOptions([
                                        {
                                            label: "Editing panels",
                                            value: 'EP',
                                        },
                                        {
                                            label: "Making panels",
                                            value: 'MP',
                                        },
                                        {
                                            label: "Making panel roles",
                                            value: 'MPR',
                                        },
                                        {
                                            label: "Removing panels",
                                            value: 'RP',
                                        },
                                        {
                                            label: "Sub Commands",
                                            value: "SC"
                                        }
                                    ])

                            )
                        await interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('Blue')
                                    .setDescription('Select one of the following:')
                            ],
                            components: [row]
                        })
                        const filter = (btn: Interaction) => {
                            return btn.user.id === interaction.user.id
                        }
                        const collector = channel.createMessageComponentCollector({
                            max: 1,
                            filter
                        })
                        collector.on('collect', async (collected) => {
                            if (collected.customId !== `${interaction.id}guide`) return;
                            if (!collected.isStringSelectMenu()) return;
                            await collected.deferUpdate()
                            switch (collected.values[0]) {
                                case "EP": {
                                    await interaction.editReply({
                                        embeds: [
                                            new EmbedBuilder()
                                                .setColor('Blue')
                                                .setDescription("**Editing Panels**\nEditing your panel can be really useful, accidentally delete a role that was assigned to a panel? Edit that role!\nWant to change the emoji? Edit that emoji\nWant to re-arrange the roles? Use re-arrange option.\n\nThe \"option\" fields in the slash command options means the position of the role in that particular panel.")
                                        ],
                                        components: []
                                    })
                                }
                                    break;
                                case "MP": {
                                    await interaction.editReply({
                                        embeds: [
                                            new EmbedBuilder()
                                                .setColor('Blue')
                                                .setDescription(`**Making Panels**\nWhile "/role-menu create" makes __new panels__, "/role-menu add" makes __new roles__ or that panel, you may need to provide the panel id while making new roles!\nYou cannot edit existing panels, but rather can make new panels and remove the one you don't want.\nThe "Role" field makes the panel exclusive to the members with that role, this means only members having the provided role can use the panel, you can leave the "Role" field empty to make it public for everyone, that is every member can use that panel.`)
                                        ],
                                        components: []
                                    })
                                }
                                    break;
                                case "MPR": {
                                    await interaction.editReply({
                                        embeds: [
                                            new EmbedBuilder()
                                                .setColor('Blue')
                                                .setDescription('**Making panel roles**\nWhile making/adding roles to your panel, make sure you provide an emoji that is from the current server! This is because the bot cannot access emojis that are from the servers the bot is not joined in. Make sure the roles you provide should be below the bot\'s role.')
                                        ],
                                        components: []
                                    })
                                }
                                    break;
                                case "RP": {
                                    await interaction.editReply({
                                        embeds: [
                                            new EmbedBuilder()
                                                .setColor('Blue')
                                                .setDescription("**Removing panels**\nYou can remove panel roles through \"/role-menu remove\" and delete panels through \"/role-menu delete\".")
                                        ],
                                        components: []
                                    })
                                }
                                    break;
                                case "SC": {
                                    await interaction.editReply({
                                        embeds: [
                                            new EmbedBuilder()
                                                .setColor('Blue')
                                                .setDescription('**Sub Commands**')
                                                .addFields(
                                                    { name: "add", value: "Adds a new role to an existing panel.", inline: false },
                                                    { name: "create", value: "Created a new panel.", inline: false },
                                                    { name: "delete", value: "Delete an existing panel.", inline: false },
                                                    { name: "edit", value: "Manage an existing panel.", inline: false },
                                                    { name: "list", value: "Lists all the panels for the server.", inline: false },
                                                    { name: "panel", value: "Sends an existing panel.", inline: false },
                                                    { name: "remove", value: "Remove a role from an existing panel.", inline: false },
                                                    { name: "view", value: "View an existing panel.", inline: false }
                                                )
                                        ],
                                        components: []
                                    })
                                }
                                    break;
                            }
                        })
                    }
                        break;
                }
            }
        }
    },
    extraInfo: {
        command_detailedExplaination: "{COMMAND} command helps in making button self roles and is highly customizable.(and more coming soon!). You can Create/Edit/Delete/View/List/Send Panels and Add/Remove/ Panel Roles, each of these subcommands have beeen explained in detail in /{COMMAND} guide"
    }
} as Command
