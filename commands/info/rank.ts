import { Rank } from "canvacord";
import { Callback, Command } from "../../typings";
import { MemberClass } from "../../classes/misc/member";
import { AttachmentBuilder, Guild, GuildMember } from "discord.js";

export default {
    name: 'rank',
    description: 'Rank',
    callback: async ({ message, args }: Callback) => {
        const member = new MemberClass().fetch(message.guild as Guild, (args[0] ?? message.author.id) as string, message) as GuildMember
        const image = new Rank()
        .setUsername(member.user.username)
        .setAvatar(member.user.displayAvatarURL())
        .setCurrentXP(50)
        .setRequiredXP(9000)
        .setProgressBar("#FFFFFF", "COLOR")
        const build = await (image.build())
        const attachment = new AttachmentBuilder(build)
        message.channel.send({files: [attachment]})
    }   
} as Command