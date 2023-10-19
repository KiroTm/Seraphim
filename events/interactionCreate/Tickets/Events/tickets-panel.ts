import { Client, EmbedBuilder, Guild, GuildMember, Interaction } from "discord.js";
import { makeTicket } from "../../../../functions/tickets/general";
import TicketChannelSchema from '../../../../models/TicketSetup'
import TicketSchema from '../../../../models/tickets-schema'
import { ConfigInstance } from "../../../../Main-Handler/ConfigHandler";
export default async (instance: ConfigInstance, interaction: Interaction) => {
    if (!interaction.isButton()) return;
    const { customId } = interaction;
    let guild = interaction.guild;
    if (customId !== `${interaction.guildId}TickeT`) return;
    const data = await TicketChannelSchema.findOne({
        GuildID: guild?.id
    })
    if (!data) {
        return;
    } else {
        const member = interaction.member as GuildMember
        let guild = interaction.guild as Guild
        const Docs = await TicketSchema.findOne({ MemberID: member.id, GuildID: guild.id, HasTicket: true })
        if (Docs) {
            const EMbed = new EmbedBuilder()
                .setColor('Red')
            await interaction.deferReply({ ephemeral: true })
            await interaction.editReply({
                embeds: [EMbed.setDescription(`You can only open 1 ticket at instance\n\nNote: You can view your active tickets via \`/tickets active\``)],
            })
        } else {
            await makeTicket(interaction, data)
        }
    }
}    