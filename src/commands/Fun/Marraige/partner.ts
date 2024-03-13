import { Callback, Command } from "../../../../typings";
import { MarriageClass } from "../../../Classes/Misc/marriage";
import { EmbedBuilder, GuildMember } from "discord.js";
import { UserClass } from "../../../Classes/Misc/user";
const marriageClass = MarriageClass.getInstance()
export default {
    name: 'partner',
    description: 'Get info about your partner',
    callback: async ({ message, args, client }: Callback) => {
        const member = message.mentions.members?.first() || message.guild?.members.cache.get(args[0] as string) || message.member
        const partner = marriageClass.getPartnerInfo(member as GuildMember)
        if (partner === 'NotMarried') return message.channel.send({ embeds: [new EmbedBuilder().setColor('Red').setDescription("You're not married")] })
        const Partner = await new UserClass().fetch(client, partner.partnerId as string)
        message.channel.send({
            embeds: [
                new EmbedBuilder()
                .setColor('Blue')
                .setAuthor({name: `${client.user?.username}`, iconURL: `${client.user?.displayAvatarURL()}`})
                .setDescription(`**${member?.user.username}** is married to **${Partner?.username}** | <t:${Math.round(parseInt(partner.time) / 1000)}:R>`)
            ]
        })
    }
} as Command