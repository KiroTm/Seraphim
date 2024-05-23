import { GuildMember, PermissionFlagsBits, EmbedBuilder, Role } from "discord.js";
import { CommandType } from "../../../Old-Handler/ConfigHandler";
import { Callback, Command } from "../../../Old-Handler/typings";
import { MemberClass } from "../../Classes/Misc/member";
import { RoleClass } from "../../Classes/Misc/role";

export default {
    name: 'role',
    description: "Manage a user's role",
    type: CommandType.legacy,
    permissions: [PermissionFlagsBits.ManageRoles],
    args: {
        minArgs: 1,
        maxArgs: -1,
        CustomErrorMessage: "?role -/remove or +/add @user/id/username @role/id/name"
    },
    cooldown: {
        Duration: '5s'
    },
    callback: async ({ message, args, guild }: Callback) => {
        const subcommands = ['-', '+', 'add', 'remove']
        const subcommand = args[0]
        const bot = message.guild?.members.me as GuildMember
        if (!subcommands.includes(subcommand)) return message.channel.send({ embeds: [new EmbedBuilder().setDescription(`Invalid subcommand!\nSubcommand must be one of: \`${subcommands.join(', ')}\``).setColor('Red')] })
        const member = new MemberClass().fetch(guild, args[1], message) as GuildMember | undefined
        if (!member) return message.channel.send({ embeds: [new EmbedBuilder().setColor('Red').setDescription("Invalid Member!")] })
        const role = (new RoleClass).fetch(guild, args[2], message) as Role | undefined
        if (!role) return message.channel.send({ embeds: [new EmbedBuilder().setColor('Red').setDescription("Invalid Role!")] })
        if (role.position > bot.roles.highest.position) return message.channel.send({embeds: [new EmbedBuilder().setColor('Red').setDescription("I cannot moderate that role")]})
        if (role.tags == null) return message.channel.send({embeds: [new EmbedBuilder().setColor('Red').setDescription(`${role.name} is managed by discord! ${bot.user.username} cannot access that role!`)]})
        if (['-', 'remove'].includes(subcommand)) {
            if (!member.roles.cache.has(role.id)) return message.channel.send({embeds: [new EmbedBuilder().setColor('Red').setDescription(`${member.user.username} doesn't have the ${role.name} role!`)]})
            member.roles.remove(role)
            return message.channel.send({embeds: [new EmbedBuilder().setColor('Green').setDescription(`${member.user.username} has had the privilege of the ${role.name} role rescinded.`)]})
        } else if (['+', 'add'].includes(subcommand)) {
            if (member.roles.cache.has(role.id)) return message.channel.send({embeds: [new EmbedBuilder().setColor('Red').setDescription(`${member.user.username} already has the ${role.name} role!`)]})
            member.roles.add(role)
            return message.channel.send({embeds: [new EmbedBuilder().setColor('Green').setDescription(`${member.user.username} has been granted the ${role.name} role!`)]})
        }
    },
    extraInfo: {
        command_usage: "{PREFIX}role -/+/remove/add @user/id/username @role/id/name",
        command_example: "{PREFIX}role add kiro muted",
        command_detailedExplaination: "This command proves invaluable when orchestrating member roles, offering subcommands like - or \"remove\" for role removal and + or \"add\" for role addition. It's imperative to remember that the roles in question must be positioned below the bot's highest role to guarantee the command's uninterrupted functionality."
    }
} as Command