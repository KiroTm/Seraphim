import { EmbedBuilder, GuildMember, PermissionFlagsBits, Role } from "discord.js";
import { CommandType } from "../../Main-Handler/ConfigHandler"
import { Callback, Command } from '../../typings';
import { MemberClass } from "../../classes/misc/member";
import { MuteClass } from "../../classes/moderation/mute";
import ms from 'ms';

const memberClass = new MemberClass();
const muteClass = MuteClass.getInstance();

export default {
    name: "mute",
    description: "Mute user",
    type: CommandType.legacy,
    args: {
        CustomErrorMessage: "{PREFIX}mute @user/id/username time reason*\nOptional Parameters: `time, reason`",
        maxArgs: -1,
        minArgs: 1
    },
    permissions: [
        PermissionFlagsBits.KickMembers,
        PermissionFlagsBits.BanMembers
    ],
    cooldown: {
        Duration: "5s",
    },
    callback: async ({ message, channel, args, guild }: Callback) => {
        const member = memberClass.fetch(guild, args[0], message) as GuildMember | undefined;
        if (!member) return channel.send({ embeds: [new EmbedBuilder().setColor('Red').setDescription("Invalid Member!")] });
        const time = args[1] ? ms(args[1]) : null;
        const expirationTime = time ? Date.now() + time : null;
        const reason = args.slice(time === undefined ? 1 : 2).join(' ') || 'No reason given';
        const mutedRole = guild.roles.cache.find((r) => r.name.toLowerCase() === "muted") as Role;
        if (!mutedRole) {
            member.timeout(360000);
            return channel.send({ embeds: [new EmbedBuilder().setDescription(`This server doesn't have a muted role! ${member.user.username} was rather timed out for 6 minutes. To start using the mute command, kindly setup the muted role.`).setColor('Red')] })
        }
        const bot = guild.members.me as GuildMember

        if ((mutedRole.position < member.roles.highest.position) || (member.user.bot)) {
            return channel.send({ embeds: [new EmbedBuilder().setColor('Red').setDescription("Muted Role will have no effect on this member/bot, can't mute that member")] })
        } else if (bot.roles.highest.position < member.roles.highest.position) {
            return channel.send({ embeds: [new EmbedBuilder().setColor('Red').setDescription("Bot's highest role is below than that of the member, can't mute that member")] })
        } else if (bot.roles.highest.position <= mutedRole.position) {
            return channel.send({ embeds: [new EmbedBuilder().setColor('Red').setDescription("Muted Role is above my highest role, drag my role above the muted role")] })
        }
        const determineMuted = await muteClass.isMuted(member, mutedRole)
        if (determineMuted) return message.channel.send({ embeds: [new EmbedBuilder().setDescription(`${member.user.username} is already muted!`).setColor('Red')] })
        const result = await muteClass.mute(message, member, mutedRole, reason, expirationTime) as boolean;
        if (result) {
            const timeString = time ? `for ${ms(time, { long: true })}` : '';
            const description = `**${member.user.username} was muted ${timeString} | ${reason}**`;
            member.user.send({ embeds: [new EmbedBuilder().setColor("Blue").setDescription(`**You were muted in ${guild.name} ${timeString} | ${reason}**\nModerator: ${message.author.username}\nTiming: <t:${Math.floor(Math.round(message.createdTimestamp / 1000))}:R>`)] }).catch((r) => {})
            return channel.send({ embeds: [new EmbedBuilder().setColor("Green").setDescription(description)] });
        } else {
            return channel.send({ embeds: [new EmbedBuilder().setColor('Red').setDescription("Couldn't mute that user.")] });
        }
    },
    extraInfo: {
        command_example: "{PREFIX}mute kiro 15m chatflood\n{PREFIX}mute @kiro 15m\n{PREFIX}mute 919568881939517460 using racial slurs 😤",
        command_usage: "{PREFIX}mute @user/id/username time reason",
        command_detailedExplaination: "The \"mute\" command necessitates the presence of a \"muted role\" to function effectively. While the command itself is fairly straightforward, moderators often encounter confusion when dealing with its optional parameters.\n\nCase-I: Input: {PREFIX}mute kiro 10m asked for it\nResult: **thekiro was muted for 10 minutes | asked for it**\n\nCase-II: Input: {PREFIX}mute kiro 15m\nResult: **thekiro was muted for 15 minutes | No reason given**\n\nCase-III: Input: {PREFIX}mute kiro using mee6 🤮\nResult: **thekiro was muted | using mee6 🤮** (permanent mute)\n**Please note:** In cases where the time parameter is invalid, it will be treated as a part of the reason parameter."
    }
} as Command;
