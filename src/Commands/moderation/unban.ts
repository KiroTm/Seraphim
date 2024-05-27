import { EmbedBuilder, GuildMember, PermissionFlagsBits, User } from "discord.js";
import { CommandType } from "../../../OldHandler/ConfigHandler";
import { Callback, Command } from "../../../OldHandler/typings";
import { MemberClass } from "../../Classes/Misc/member";
import { client } from "../..";
import { UserClass } from "../../Classes/Misc/user";

export default {
    name: "unban",
    description: "Unbans a user",
    type: CommandType.legacy,
    permissions: [
        PermissionFlagsBits.BanMembers
    ],
    cooldown: {
        Duration: "5s"
    },
    args: {
        minArgs: 1,
        maxArgs: -1,
        CustomErrorMessage: "{PREFIX}unban @user/id reason"
    },
    callback: async ({message, args, client }: Callback) => {
        const target = await (new UserClass()).fetch(client, args[0], message) as User
        if (!target) return message.channel.send({embeds: [new EmbedBuilder().setColor('Red').setDescription("Searched far wide, user not found!")]})
        const reason = args.splice(1).join(' ') || "No reason given"
        message.guild?.bans.remove(target, reason)
        return message.channel.send({embeds: [new EmbedBuilder().setColor('Green').setDescription(`**${target.username} was unbanned | ${reason}**`)]})
    },
    extraInfo: {
        command_example: "{PREFIX}unban 646937666251915264 appealed",
        command_usage: "{PREFIX}unban @user/id reason"
    }
} as Command