import { Callback, Command } from "../../../../OldHandler/typings";
import { EmbedBuilder, GuildMember, Message } from 'discord.js';
import { MarriageClass } from "../../../Classes/Misc/marriage";
const marriageClass = MarriageClass.getInstance()

export default {
    name: 'ship',
    description: 'Ship',
    cooldown: { Duration: '2s', Type: 'perUserCooldown', CustomCooldownMessage: "If only these ships were real... But they're not, calm down." },
    callback: async ({ message, args }: Callback) => {
        const v = args.length;
        let f: GuildMember | string;
        let s: GuildMember | string;

        if (!v) [f, s] = [message.member as GuildMember, message.guild?.members.cache.random() as GuildMember];
        else if (v === 1) [f, s] = [message.mentions.members?.first() as GuildMember || args[0], message.member as GuildMember];
        else[f, s] = [message.mentions.members?.first() as GuildMember || args[0], Array.from(message.mentions.members!)[1]?.[1] as GuildMember || args[1]];

        const fa = typeof f === 'object' ? f.nickname ?? f.user.globalName ?? f.user.username : f;
        const sa = typeof s === 'object' ? s.nickname ?? s.user.globalName ?? s.user.username : s;

        const Ship = marriageClass.Ship(fa, sa);

        message.channel.send({
            content: `**💝Matchmaking💝**\n🔺\`${fa}\`\n🔻\`${sa}\``,
            embeds: [new EmbedBuilder().setColor('#FFC0CB').setDescription(`**🔀 ${Ship.name}**\n${Ship.bar}${Ship.percent}%`)],
            allowedMentions: { roles: [], users: [] }
        });
    },
    extraInfo: {
        command_usage: "{PREFIX}ship [member1] [member2]",
        command_example: "{PREFIX}ship @user1 @user2",
        command_detailedExplaination: "This command allows users to 'ship' or imagine a romantic relationship between two mentioned members. If no members are mentioned, it randomly selects two members from the server. It then calculates a 'ship name' and a 'ship percentage' based on the provided or randomly selected members. The command has a cooldown of 2 seconds per user and displays a custom cooldown message if the cooldown is triggered."
    }

} as Command;
