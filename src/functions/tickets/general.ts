import { ButtonInteraction, Role, GuildMember, User, ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextChannel, Guild, InteractionUpdateOptions } from "discord.js";
import TicketSchema from '../../Models/tickets-schema'
export async function makeTicket(interaction: ButtonInteraction, data: any) {
    const member = interaction.member as GuildMember
    let guild = interaction.guild as Guild
    const Member = guild.members.cache.find((m) => m.id === interaction.member?.user.id) as GuildMember
    const Everyone = guild.roles.cache.find((r) => r.id === guild.id) as Role
    const Bot = interaction.client.user as User
    await interaction.deferReply({ ephemeral: true })
    const ID = (await import('nanoid')).nanoid()
    guild.channels.create({
        name: `${interaction.user.username.replace(/ /g, '')}`,
        type: ChannelType.GuildText,
        parent: data.Category,
        permissionOverwrites: [
            {
                id: Member.id,
                allow: ['SendMessages', 'ViewChannel', 'ReadMessageHistory']
            },
            {
                id: Everyone.id,
                deny: ['SendMessages', 'ViewChannel', 'ReadMessageHistory']
            },
            {
                id: Bot.id,
                allow: ['SendMessages', 'ManageChannels', 'ViewChannel']
            },
        ]
    })
        .then(async (channel) => {
            data.Handlers.forEach((h: string) => {
                channel.permissionOverwrites.edit(h, {
                    ManageChannels: true,
                    SendMessages: true,
                    ReadMessageHistory: true,
                    AddReactions: true
                })
            })
            await TicketSchema.create({
                GuildID: guild.id,
                MemberID: member.id,
                TicketID: ID,
                ChannelID: channel.id,
                Closed: false,
                Locked: false,
                Type: data.Type,
                Claimed: false,
                ClaimedBy: "None",
                HasTicket: true,
            });
            const GuildIconUrl = guild.iconURL({ forceStatic: false }) as string
            const Embed = new EmbedBuilder()
                .setAuthor({
                    name: `${guild.name} | Ticket: ${ID}`,
                    iconURL: GuildIconUrl
                })
                .setDescription(`
                    Ticket Type: ${data.Type}\n\n
                    Ticket opened By: ${member.user.username} **ID:**${member.user.id}
                    Please wait patiently for a response from a Staff team, meanwhile you can type in about your issue in detail.
                `)
                .setFooter({
                    text: "Do not interact with buttons, these are meant for Staff!"
                })
                .setColor("#fd6500")
            const Buttons = new ActionRowBuilder<ButtonBuilder>();
            Buttons.addComponents(
                new ButtonBuilder()
                    .setCustomId("ticket_close")
                    .setLabel("Save Ticket")
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji("💾"),

                new ButtonBuilder()
                    .setCustomId("ticket_lock")
                    .setLabel("Lock")
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji("<:lock:1092350974888267827>"),

                new ButtonBuilder()
                    .setCustomId("ticket_unlock")
                    .setLabel("Unlock")
                    .setStyle(ButtonStyle.Success)
                    .setEmoji("<:unlock:1092350970983366708>"),

                new ButtonBuilder()
                    .setCustomId("ticket_claim")
                    .setLabel("Claim")
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji("🛄"),
            );
            channel.send({
                embeds: [Embed],
                components: [Buttons],
                content: `${member.user} Welcome to this ticket`
            });
            await interaction.editReply({
                content: `Your ticket has been issued! | Channel: <#${channel.id}>`
            });
        })
        .catch(async (err) => {
            console.log(err)
            await interaction.editReply({
                content: `This is bad!`,
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(`Error: ${err}\nSomething feels odd, kindly contact the developer or join the support server in bot bio.`)
                ]
            })
        })
}