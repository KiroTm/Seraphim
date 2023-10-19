import { EmbedBuilder, GuildMember, PermissionFlagsBits, User } from "discord.js";
import { Callback, Command } from "../../typings";
import { CommandType } from "../../Main-Handler/ConfigHandler";
import { MemberClass } from "../../classes/misc/member";
import { Modlogs } from "../../classes/moderation/modlogs";
import { Messagepagination } from "../../functions/utility/pagination";
const ModlogsClass = Modlogs.getInstance()
export default {
    name: "modlogs",
    description: "View a member's modlogs",
    permissions: [PermissionFlagsBits.BanMembers, PermissionFlagsBits.KickMembers],
    type: CommandType.legacy,
    aliases: ["logs"],
    args: {
        minArgs: 1,
        maxArgs: -1,
        CustomErrorMessage: "{PREFIX}modlogs @user/id/username"
    },
    cooldown: {
        Duration: '5s'
    },
    callback: async ({ message, guild, args }: Callback) => {
        const member = new MemberClass().fetch(guild, args[0], message) as GuildMember;
        if (!member) return message.channel.send({ embeds: [new EmbedBuilder().setColor('Red').setDescription("Invalid member!")] });
        const modlogs = ModlogsClass.Modlogs.filter((value, key) => value.UserID == member.user.id)
        if (modlogs.size < 1) return message.channel.send({ embeds: [new EmbedBuilder().setColor('Red').setDescription(`${member.user.username} has no modlogs!`)] });
        const chunkify = (arr: Array<any>, len: number) => Array.from({ length: Math.ceil(arr.length / len) }, (_, i) => arr.slice(i * len, i * len + len));
        const pages = chunkify(modlogs.map((value, key) => {
            const Moderator = message.client.users.cache.find(u => u.id == value.StaffID) as User | "Unknown";
            return `**Case:** ${key}\n**Type:** ${value.Type}\n**User:** (${value.UserID}) ${member}\n**Moderator:** ${Moderator}\n**Reason:** ${value.Reason} - ${new Date(value.CreatedAt).toLocaleDateString()}`;
        }), 3).map(chunk => new EmbedBuilder()
            .setTitle(`Modlogs for ${member.user.username}`)
            .setColor('Blue')
            .setDescription(chunk.join("\n\n"))
        );
        Messagepagination(message, pages, 1000 * 90);
    },
    extraInfo: {
        command_detailedExplaination: "The \"Modlogs\" command meticulously showcases a comprehensive history of all moderation actions carried out on a member. Each individual modlog case is meticulously assigned a unique CaseID, offering invaluable granularity and precision in tracking these actions.",
        command_example: "{PREFIX}modlogs kiro\n?logs 919568881939517460\n{PREFIX}modlogs @thekiro",
        command_usage: "{PREFIX}modlogs @user/id/username"
    }
} as Command