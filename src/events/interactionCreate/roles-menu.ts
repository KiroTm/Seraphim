import { ButtonInteraction, EmbedBuilder, Guild, GuildMember, Interaction, Message, Role } from "discord.js";
import { ConfigHandler } from "../../../Main-Handler/ConfigHandler";
import ButtonRolesSchema from "../../Models/ButtonRoles-schema";
async function Error(interaction: ButtonInteraction, Description: string) {
    await interaction.editReply({
        embeds: [
            new EmbedBuilder()
                .setColor('Red')
                .setDescription(Description)
        ]
    })
}
async function Success(interaction: ButtonInteraction, Description: string) {
    await interaction.editReply({
        embeds: [
            new EmbedBuilder()
                .setColor('Blue')
                .setDescription(Description)
        ]
    })
}
export default async (instance: ConfigHandler, interaction: Interaction) => {
    if (!interaction.isButton()) return;
    const guild = interaction.guild as Guild;
    const member = interaction.member as GuildMember;
    const message = interaction.message as Message;
    if (!message.embeds.length) return;
    const name = message.embeds[0].title?.toLowerCase()
    const Data = await ButtonRolesSchema.findOne({ GuildId: guild.id, Name: name }).catch((err) => { })
    if (!Data) return;
    const customId = interaction.customId;
    const Ids = Data.Roles.map((x: any) => x.RoleID)
    if (!Ids.includes(customId)) return
    await interaction.deferReply({ ephemeral: true })
    const roleId = customId
    const role = guild.roles.cache.get(roleId) as Role
    const memberRoles = member.roles
    const hasRole = memberRoles.cache.get(roleId)
    const ClientMember = await guild.members.fetchMe() as GuildMember
    if (!role) return await Error(interaction, `That role doesn't exist`)
    if (ClientMember.roles.highest.position <= role.position) return await Error(interaction, hasRole ? "Cannot remove that role from you since this role is above mine, please contact the server Administrator" : "Cannot add that role to you since this role is above mine, please contact the server Administrator");
    if (role.position >= memberRoles.highest.position) return await Error(interaction, "Cannot upadate that role from you");
    if (Data.Role) {
        try {
            const Role = guild.roles.cache.get(Data.Role) as Role
            const reqRoleHas = memberRoles.cache.find((r) => r.id === Role.id)
            if (!reqRoleHas) return await Error(interaction, `You need to have ${Role} to get roles from this panel!`)
            hasRole ? memberRoles.remove(roleId) : memberRoles.add(roleId)
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Blue')
                        .setDescription("Roles updated!")
                ]
            })
        } catch (err) {
            interaction.editReply("There was an error! Make sure the bot has correct permissions.")
        }

    } else {
        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor('Blue')
                    .setDescription("Roles updated!")
            ]
        })
        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor('Blue')
                    .setDescription("Roles updated!")
            ]
        })
        try {
            hasRole ? memberRoles.remove(roleId) : memberRoles.add(roleId);
        } catch (error) {
            await interaction.editReply("There was an error!")
        }
    }
}        