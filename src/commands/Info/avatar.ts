import { EmbedBuilder, Guild, GuildMember, User } from "discord.js";
import { CommandType } from "../../../Main-Handler/ConfigHandler";
import { Callback, Command } from '../../../typings';
import { MemberClass } from "../../Classes/Misc/member";
import { UserClass } from "../../Classes/Misc/user";

const userClass = new UserClass();
const memberClass = new MemberClass();

export default {
    name: "avatar",
    description: "Get a member or user's avatar!",
    aliases: ['av'],
    cooldown: { Duration: '5s' },
    type: CommandType.legacy,
    callback: async ({ message, args, guild, client }: Callback) => {
        let member = args[0] ?? message.member?.id
        const target = memberClass.fetch(guild, member, message) as GuildMember
            ?? await userClass.fetch(client, member, message) as User
            ?? message.author;
        const type = args[1];

        if (!target) return message.channel.send({ embeds: [new EmbedBuilder().setColor('Red').setDescription("Couldn't fetch that user! Most likely the user doesn't exist")] });

        const isUser = 'username' in target && 'globalName' in target;

        const replyObject = {
            embeds: [
                new EmbedBuilder()
                    .setTitle(`${isUser ? target.username : target.user.username}'s ${isUser || type === 'm' ? 'member' : 'user'} avatar`)
                    .setColor('Blurple')
                    .setAuthor({    
                        name: `${isUser ? target.username : target.user.username}`,
                        iconURL: `${(isUser || type === 'm' ? target : target.user).displayAvatarURL({ forceStatic: false })}`
                    })
                    .setImage(`${(isUser || type === 'm' ? target : target.user).displayAvatarURL({ forceStatic: false, size: 4096 })}`)
            ]
        };

        message.channel.send(replyObject);
    },
    extraInfo: {
        command_example: "{PREFIX}avatar oreotm\n{PREFIX}av 600707283097485322\n{PREFIX}av @oreotm.",
        command_usage: "{PREFIX}avatar <user or member>ª\nª: Can be either of: `Id, Mention, username`",
    },
} as Command;
