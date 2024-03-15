import { Embed, EmbedBuilder, GuildMember, PermissionFlagsBits, Role } from "discord.js"
import { CommandType } from "../../../Main-Handler/ConfigHandler"
import { Callback, Command } from '../../../Main-Handler/typings';
import { MemberClass } from "../../Classes/Misc/member";
import { UnmuteClass } from "../../Classes/moderation/unmute";
export default {
    name: "unmute",
    description: "Unmutes a member that has been muted before",
    type: CommandType.legacy,
    args:{
        minArgs: 1,
        maxArgs: -1,
        CustomErrorMessage: "{PREFIX}unmute @user/id/username <reason>"
    },
    permissions: [
        PermissionFlagsBits.KickMembers,
        PermissionFlagsBits.BanMembers
    ],
    cooldown: {
        Duration: '5s'
    },
    callback: async ({ args, message, guild}: Callback) => {
        const member = (new MemberClass).fetch(guild, args[0], message) as GuildMember | undefined
        const reason = args.slice(1).join(' ') || "No reason given"
        if (!member) return message.channel.send({embeds: [new EmbedBuilder().setColor('Red').setDescription("Invalid Member!")]})
        const mutedRole = message.guild?.roles.cache.find((r) => r.name.toLowerCase() == 'muted') as Role
        const unmute = await (new UnmuteClass()).unmute(member, mutedRole, message, reason)
        if (!unmute) return message.channel.send({embeds: [new EmbedBuilder().setColor('Red').setDescription(`${member.user.username} isn't muted!`)]})
        member.user.send({ embeds: [new EmbedBuilder().setColor("Blue").setDescription(`**You were unmuted in ${message.guild?.name} | ${reason}**\nModerator: ${message.author.username}\nTiming: <t:${Math.floor(Math.round(message.createdTimestamp/1000))}:R>`)] }).catch((er) => {})
        message.channel.send({embeds: [new EmbedBuilder().setColor('Green').setDescription(`**${member.user.username} was unmuted | ${reason}**`)]})
    },
    extraInfo: {
        command_example: "{PREFIX}unmute kiro wrong mention lol\n?unmute oreotm.",
        command_usage: "{PREFIX}unmute @user/id/username reason\nOptional Paramters: `reason`"
    }
} as Command