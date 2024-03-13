import DJS, { ButtonInteraction, ActionRowBuilder, EmbedBuilder, Guild, GuildMember, Interaction, InteractionReplyOptions, TextChannel, ButtonBuilder, ButtonStyle } from "discord.js";
import DB from "../../../../models/tickets-schema"
import TicketSetupData from '../../../../models/TicketSetup'
import { ConfigInstance } from "../../../../../Main-Handler/ConfigHandler";
async function editReply(interaction: ButtonInteraction, options: InteractionReplyOptions) { await interaction.editReply(options) }
function canRun(member: GuildMember, data: any): boolean {
    const handlers = data.Handlers as string[]
    const MemberRoles = member.roles.cache.map((r) => { return r.id })
    const Object = {
        Handlers: handlers,
        Roles: MemberRoles
    }
    return Object.Roles.some(role => Object.Handlers.includes(role));
}
export default async (instance: ConfigInstance, interaction: Interaction) => {
    if (!interaction.isButton()) return;
    const CustomId = interaction.customId as string
    if (!["ticket_close", "ticket_lock", "ticket_unlock", "ticket_claim"].includes(CustomId)) return;
    await interaction.deferReply({ ephemeral: true })
    const guild = interaction.guild as Guild
    const member = interaction.member as GuildMember
    const channel = interaction.channel as TextChannel
    const TicketSetups = await TicketSetupData.findOne({ GuildID: guild?.id })
    if (!TicketSetups) return await editReply(interaction, { content: `Cannot fetch data for this guild, please make sure you have tickets enabled for/in this guild.`, ephemeral: true })
    const docs = await DB.findOne({ GuildID: guild.id, ChannelID: channel.id })
    if (!docs) return editReply(interaction, { content: "<:fail:1146683470114996274> Could not find any data regarding this ticket, please re-initiate a ticket!" })
    const LOCKED = docs.Locked as boolean
    const CLOSED = docs.Closed as boolean
    const CLAIMED = docs.Claimed as boolean
    switch (CustomId) {
        case "ticket_close":
            if (canRun(member, TicketSetups)) {
                if (CLOSED) {
                    await editReply(interaction, { content: "This ticked is already closed" })
                } else {
                    await DB.updateOne({ ChannelID: channel.id }, { Closed: true, HasTicket: true })
                    await interaction.editReply({
                        content: `This ticket will be closed soon!`
                    })
                    await docs.MemberID.forEach(async (m: DJS.GuildMember) => {
                        await channel.permissionOverwrites.edit(m, {
                            'SendMessages': false,
                            'ViewChannel': false,
                        });
                    });
                    const TranscriptButton = new ButtonBuilder()
                        .setCustomId("ticket_close_transcript")
                        .setLabel("Transcript")
                        .setEmoji("<:Note:1092500769225310258>")
                        .setStyle(ButtonStyle.Primary)

                    const DeleteButton = new ButtonBuilder()
                        .setCustomId("ticket_close_delete")
                        .setLabel("Delete")
                        .setEmoji("<:Trash:1092057092799594638>")
                        .setStyle(ButtonStyle.Danger)

                    const ReopenButton = new ButtonBuilder()
                        .setCustomId("ticket_close_reopen")
                        .setLabel("Reopen")
                        .setEmoji("<:Folder:1092058483848917032>")
                        .setStyle(ButtonStyle.Secondary)

                    let row = new ActionRowBuilder<ButtonBuilder>().addComponents(TranscriptButton, DeleteButton, ReopenButton)
                    await channel.send({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('Yellow')
                                .setTitle('Ticket Controls')
                                .setDescription(`This ticket has been closed by ${member.user} [${member.user.id}]`)
                                .addFields(
                                    { name: "Transcript", value: "If you have a transcript channel set, the transcript will be sent to that channel. Otherwise the transcript will be send in this channel." },
                                    { name: "Delete", value: "This ticket will be deleted shortly once you click this. (transcript wont be send after deletion, you'll have to manually generate a transcript.)" },
                                    { name: "Reopen", value: "Reopen this ticket, the ticket initiator will be added back to the channel" }
                                )
                        ],
                        components: [row]
                    })
                }
            } else {
                return await editReply(interaction, { content: `Do not use these fancy buttons just for the sake of clicking. They are intended for a specific purpose and should not be used frivolously.` })
            }
            break;

        case "ticket_lock":
            if (canRun(member, TicketSetups)) {
                if (LOCKED) {
                    await interaction.editReply(`Ticket Already locked`)
                } else {
                    await interaction.editReply({
                        content: `Locking ticket..`,
                    })
                    await DB.updateOne({ ChannelID: channel.id }, { Locked: true });
                    await docs.MemberID.forEach(async (m: DJS.GuildMember) => {
                        await channel.permissionOverwrites.edit(m, {
                            'SendMessages': false,
                        });
                    });
                    const Locked = new EmbedBuilder()
                        .setColor('Green')
                        .setDescription("<:lock:1092350974888267827> | This ticket is now locked for reviewing.");
                    await channel.send({
                        embeds: [Locked]
                    });
                }
            } else {
                return await editReply(interaction, { content: `Do not use these fancy buttons just for the sake of clicking. They are intended for a specific purpose and should not be used frivolously.` })
            }

            break;

        case "ticket_unlock":
            if (canRun(member, TicketSetups)) {
                if (LOCKED) {
                    await interaction.editReply(`Unlocking ticket`)
                    await DB.updateOne({ ChannelID: channel.id }, { Locked: false });
                    await docs.MemberID.forEach(async (m: DJS.GuildMember) => {
                        channel.permissionOverwrites.edit(m, {
                            'SendMessages': true,
                        });
                    });
                    await channel.send({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription("<:unlock:1092350970983366708> | This ticket is now unlocked.")
                                .setColor('Green')
                        ]
                    });
                } else {
                    await interaction.editReply(`Ticket Already unlocked`)
                }
            } else {
                return await editReply(interaction, { content: `Do not use these fancy buttons just for the sake of clicking. They are intended for a specific purpose and should not be used frivolously.` })
            }
            break;

        case "ticket_claim":
            if (canRun(member, TicketSetups)) {
                await interaction.editReply(`Initiating your claim..`)
                await DB.updateOne({ ChannelID: channel.id }, { Claimed: true, ClaimedBy: member.id })
                await channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Green')
                            .setDescription(`This ticket has been claimed by ${member.user}`)
                    ]
                })
            } else {
                return await editReply(interaction, { content: `Do not use these fancy buttons just for the sake of clicking. They are intended for a specific purpose and should not be used frivolously.` })
            }
            break;
    }
    // const client = instance._client as Client
    // if (!interaction.isButton()) return;
    // const { customId } = interaction
    // if (!["close", "lock", "unlock", "claim"].includes(customId)) return;
    // const channel = interaction.channel as TextChannel
    // const guild = interaction.guild as Guild
    // const member = interaction.member as GuildMember
    // const TicketSetup = await TicketSetupData.findOne({ GuildID: guild.id });
    // if (!TicketSetup) {
    //     await interaction.reply({
    //         content: `Can't fetch data for ${guild.name}, make sure you have tickets setup in this guild \n If not, use "/ticketmodule setup"`,
    //         ephemeral: true,
    //     })

    // } else {
    //     if (!member.roles.cache.find((r) => r.id === TicketSetup.Handlers)|| !member.permissions.has([PermissionFlagsBits.Administrator])) {
    //         await interaction.reply({
    //             embeds: [
    //                 new EmbedBuilder()
    //                     .setColor('Blue')
    //                     .setDescription(`<:AveryInfo:998920382826414160> You cannot use these buttons!`)
    //             ],
    //             ephemeral: true
    //         })
    //     } else {
    //         const docs = await DB.findOne({
    //             ChannelID: channel.id
    //         })
    //         if (!docs) {

    //             const NoDataFound = new EmbedBuilder()
    //                 .setColor('Red')
    //                 .setDescription(`<:fail:1146683470114996274> Could not find any data regarding this ticket, please re-initiate a ticket!`)
    //             await channel.send({
    //                 embeds: [NoDataFound]
    //             })
    //         } else {
    //             const LOCKED = await docs.Locked
    //             const Closed = await docs.Closed
    //             const Claimed = await docs.Claimed
    //             switch (customId) {
    //                 case "lock":
    //                     if (LOCKED == true) {
    //                         await interaction.deferReply({ ephemeral: true, fetchReply: true })
    //                         await interaction.editReply({
    //                             content: `This ticket is already locked`,
    //                         })
    //                     } else {
    //                         await interaction.deferReply({ ephemeral: true, fetchReply: true })
    //                         await interaction.editReply({
    //                             content: `Locking ticket..`,
    //                         })
    //                         await DB.updateOne({ ChannelID: channel.id }, { Locked: true });
    //                         await docs.MemberID.forEach(async (m: DJS.GuildMember) => {
    //                             await channel.permissionOverwrites.edit(m, {
    //                                 'SendMessages': false,
    //                             });
    //                         });
    //                         const Locked = new EmbedBuilder()
    //                             .setColor('Green')
    //                             .setDescription("🔒 | This ticket is now locked for reviewing.");
    //                         await interaction.editReply({
    //                             content: `Done!`,
    //                         });
    //                         await interaction.channel?.send({
    //                             embeds: [Locked]                            
    //                         });
    //                         await interaction.deleteReply()
    //                     }
    //                     break;

    //                 case "unlock":
    //                     await interaction.deferReply({ ephemeral: true, fetchReply: true })
    //                     if (LOCKED == false) {
    //                         await interaction.editReply({
    //                             content: `This ticket is already unlocked`,
    //                         })
    //                     } else {
    //                         await interaction.editReply({
    //                             content: `Unlocking ticket..`,
    //                         })
    //                         await DB.updateOne({ ChannelID: channel.id }, { Locked: false });
    //                         await docs.MemberID.forEach(async (m: DJS.GuildMember) => {
    //                             channel.permissionOverwrites.edit(m, {
    //                                 'SendMessages': true,
    //                             });
    //                         });
    //                         const unlocked = new EmbedBuilder()
    //                             .setDescription("🔓 | This ticket is now unlocked.")
    //                             .setColor('Green')
    //                         await interaction.editReply({
    //                             content: `Done!`,
    //                         });
    //                         await interaction.channel?.send({
    //                             embeds: [unlocked]                            
    //                         });
    //                         await interaction.deleteReply()
    //                     }
    //                     break;

    //                 case "close":
    //                     if (Closed == true) {
    //                         await interaction.deferUpdate()
    //                     } else {
    //                         await interaction.deferReply({ephemeral: true})
    //                         await docs.MemberID.forEach(async (m: DJS.GuildMember) => {
    //                             await channel.permissionOverwrites.edit(m, {
    //                                 'SendMessages': false,
    //                             });
    //                         });
    //                         if (await TicketSetup.Transcripts === "None") {
    //                             await interaction.editReply({
    //                                 content: `Saving ticket..`,
    //                             })
    //                             await DB.updateOne({ ChannelID: channel.id }, { Closed: true, HasTicket: false })
    //                             await interaction.editReply({
    //                                 content: `Done!`,
    //                                 embeds: [
    //                                     new EmbedBuilder()
    //                                         .setColor('Blue')
    //                                         .setDescription('This ticket will close in 10 seconds')
    //                                 ]
    //                             })
    //                             await interaction.channel?.send({
    //                                 embeds: [
    //                                     new EmbedBuilder()
    //                                     .setColor('Blue')
    //                                     .setDescription(`This ticket has been\nClosed by: <@!${interaction.user.id}>${docs.ClaimedBy ==="None"?``:`\nClaimedBy: <@${await docs.ClaimedBy}>`}`)
    //                                 ]
    //                             })
    //                             const attachment = await createTranscript(channel, {                                        
    //                                 limit: -1,
    //                                 filename: `${docs.Type} - ${docs.TicketID}.html`                                    
    //                             });
    //                             const Ownerchannel = client.channels.cache.find((c) => c.id === "1026064893243314196") as TextChannel
    //                             const msg = await Ownerchannel.send({files: [attachment]})
    //                             const attachmentUrl = msg.attachments.first()?.url
    //                             await DB.updateOne({ ChannelID: channel.id }, { Closed: true, HasTicket: false, TranscriptLink: attachmentUrl})                                 
    //                             setTimeout(async () => {
    //                                 await channel.delete();
    //                             }, 1000 * 10)

    //                         } else {
    //                             const attachment = await createTranscript(channel, {                                        
    //                                 limit: -1,
    //                                 filename: `${docs.Type} - ${docs.TicketID}.html`                                    
    //                             });
    //                             const Ownerchannel = client.channels.cache.find((c) => c.id === "1026064893243314196") as TextChannel
    //                             const msg = await Ownerchannel.send({files: [attachment]})
    //                             const attachmentUrl = msg.attachments.first()?.url
    //                             await DB.updateOne({ ChannelID: channel.id }, { Closed: true, HasTicket: false, })
    //                             const TransciptChannel = guild.channels.cache.find((c) => c.id === TicketSetup.Transcripts) as TextChannel
    //                             const TranscriptEmbed = new EmbedBuilder()
    //                                 .setColor("#fd6500")
    //                                 .setTitle(`Transcript Type: ${docs.Type}\n ID: ${docs.TicketID}`)
    //                             const Message = await TransciptChannel.send({
    //                                 embeds: [TranscriptEmbed.setDescription(`Transcript Url: [here](${attachmentUrl})`)]
    //                             })
    //                             const Closed = new EmbedBuilder()
    //                             .setColor('Green')
    //                             await interaction.editReply({
    //                                 content: `This ticket will close shortly`,
    //                                 embeds: [Closed.setDescription(`The transcript is now saved [TRANSCRIPT](${Message.url})`)]
    //                             })
    //                             await DB.updateOne({ ChannelID: channel.id }, { Closed: true, HasTicket: false, TranscriptLink: attachmentUrl})
    //                             await interaction.channel?.send({
    //                                 embeds: [
    //                                     new EmbedBuilder()
    //                                     .setColor('Blue')
    //                                     .setDescription(`This ticket has been\nClosed by: <@!${interaction.user.id}>${docs.ClaimedBy ==="None"?``:`\nClaimedBy: <@${await docs.ClaimedBy}>`}`)
    //                                 ]
    //                             })
    //                             setTimeout(async () => {
    //                                 await channel.delete();
    //                             }, 1000 * 10)
    //                         }
    //                     }
    //                     break;
    //                 case "claim":
    //                     if (Claimed == true) {
    //                         await interaction.deferReply({ ephemeral: true })
    //                         await interaction.followUp({
    //                             content: `This ticket has already been claimed by <@!${docs.ClaimedBy}>`,
    //                         })
    //                     } else {
    //                         await interaction.deferReply({ ephemeral: true })
    //                         await interaction.editReply({
    //                             content: `Initiating your claim`,
    //                         })                                
    //                         await DB.updateOne({ ChannelID: channel.id }, { Claimed: true, ClaimedBy: member.id, HasTicket: false })
    //                         const Claimed = new EmbedBuilder()
    //                             .setColor('Green')
    //                             .setDescription(`📁 | This ticket is now Claimed by <@!${interaction.user.id}>`)
    //                         await channel.send({
    //                             embeds: [Claimed]
    //                         })
    //                         await interaction.deleteReply()
    //                     }
    //                     break;
    //             }
    //         }

    //     }
    // }


}