import { EmbedBuilder, Guild, GuildMember, PermissionFlagsBits, PermissionsBitField } from "discord.js"
import { CommandType } from "../../../OldHandler/ConfigHandler"
import { Callback, Command } from '../../../OldHandler/typings';
import { MemberClass } from "../../Classes/Misc/member";
import warnSchema from "../../Models/warnSchema";
import ModlogsSchema from "../../Models/Modlogs-Schema";
import { ModlogType } from "../../Classes/moderation/modlogs";
import { WarnClass } from "../../Classes/moderation/warn";
const warnClass = WarnClass.getInstance()
export default {
    name: "warn",
    description: "logs a warning for the member",
    type: CommandType.legacy,
    permissions: [
        PermissionFlagsBits.KickMembers
    ],
    cooldown: {
        Duration: '1s'
    },
    args: {
        minArgs: 1,
        maxArgs: -1,
        CustomErrorMessage: "{PREFIX}warn @user/id/username reason"
    },
    callback: async ({ args, message, guild }: Callback) => {
        const member = new MemberClass().fetch(guild, args[0], message) as GuildMember
        if (!member) return message.channel.send({embeds: [new EmbedBuilder().setColor('Red').setDescription('Invalid member!')]})
        const reason = args.splice(1).join(" ").replace("--s", "") || "No reason given"
        warnClass.warn(member, message.member!, reason)
        member.send({embeds: [new EmbedBuilder().setColor('Blue').setDescription(`**You were warned in ${member.guild.name} | ${reason}**\nModerator: ${message.author.username}\nTiming: <t:${Math.floor(Math.round(message.createdTimestamp/1000))}:R>`)]}).catch((r) => {})
        if (message.content.endsWith("-s")) {
            return message.delete().catch(() => {})
        }
        message.channel.send({embeds: [new EmbedBuilder().setColor('Green').setDescription(`**${member.user.username} has been warned | ${reason}**`)]})
    },
    extraInfo: {
        command_usage: "{PREFIX}warn @user/id/username reason\nOptional Parameters: `reason`",
        command_example: "{PREFIX}warn kiro trying to bypass automoderation\n?warn 919568881939517460"
    }
} as Command