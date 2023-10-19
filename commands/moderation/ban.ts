import { EmbedBuilder, GuildMember, PermissionFlagsBits } from "discord.js";
import { CommandType } from "../../Main-Handler/ConfigHandler";
import { Callback, Command } from "../../typings";
import { MemberClass } from "../../classes/misc/member";

export default {
    name: "ban",
    description: "Bans a user",
    type: CommandType.legacy,
    permissions: [
        PermissionFlagsBits.BanMembers
    ],
    cooldown: {
        Duration: '5s'
    },
    args: {
        minArgs: 1,
        maxArgs: -1,
        CustomErrorMessage: "{PREFIX}ban @user/id/name"
    },
    callback: async ({message, args, guild }: Callback) => {
        const member = new MemberClass().fetch(guild, args[0], message) as GuildMember
        const reason = args.splice(1).join(' ') || "No reason given"
        if (!member) return message.channel.send({embeds: [new EmbedBuilder().setColor('Red').setDescription("Invalid member!")]})
        if (!member.bannable) return message.channel.send({embeds: [new EmbedBuilder().setDescription(`I can't ban ${member.user.username}`).setColor('Red')]})
        await member.user.send({embeds: [new EmbedBuilder().setColor('Blue').setDescription(`**You were banned in ${member.guild.name} | ${reason}**\nModerator: ${message.author.username}\nTiming: <t:${Math.floor(Math.round(message.createdTimestamp/1000))}:R>`)]}).catch((r) => {})
        member.ban()
        return message.channel.send({embeds: [new EmbedBuilder().setColor('Green').setDescription(`${member.user.username} was banned | ${reason}`)]})
    },
    extraInfo: {
        command_usage: "{PREFIX}ban @User reason\nOptional Paramters: \`reason\`",
        command_example: "{PREFIX}ban @Oreo Raiding the server",
        command_detailedExplaination: "The optional parameter `reason` will be replaced with: \"No reason given\""
    }
} as Command