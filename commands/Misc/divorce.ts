import { Callback, Command } from "../../typings";
import { MarriageClass } from "../../classes/misc/marriage";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ColorResolvable, ComponentType, EmbedBuilder, GuildMember, Message } from "discord.js";
const marriageClass = MarriageClass.getInstance();
async function divorce(a: GuildMember, b: GuildMember, message: Message): Promise<{description: string, color: ColorResolvable}> {
    const collector = message.createMessageComponentCollector({
        filter: (i: ButtonInteraction) => i.user.id === b.id,
        time: 10000,
        componentType: ComponentType.Button
    });

    return new Promise<{description: string, color: ColorResolvable}>((resolve) => {
        collector.on("collect", (i: ButtonInteraction) => { 
            collector.stop(i.customId)
        });

        collector.on("end", (collected, reason) => {
            message.edit({ components: [] }).catch(() => null);
            return resolve(
                reason === 'accept' ? {description: `${a} and ${b} are now divorced 💔!`, color: 'Green'} :
                reason === 'reject' ? {description: `${b} rejected ${a}'s proposal.. 💝`, color: 'Red'} :
                reason === 'time' ? { description: `${b} didn't respond in time! ⏰`, color: 'Red' } :
                { description: 'Error, something went wrong.', color: 'Red' }
                )
        });
    });
}


export default {
    name: 'divorce',
    description: 'Divorce',
    cooldown: {
        Duration: '15s',
        Type: 'perUserCooldown'
    },
    callback: async ({ message, args }: Callback) => {
        const partner = message.mentions.members?.first() || message.guild?.members.cache.get(args[0]) || undefined
        const divorcer = message.member || undefined
        if (!divorcer || !partner || partner.user.bot || partner.user.id === divorcer.user.id) return message.channel.send({embeds: [new EmbedBuilder().setColor('Red').setDescription('You cannot divorce them.')]})
        const canDivorce = marriageClass.canDivorce(divorcer, partner)
        if (typeof canDivorce === 'string') return message.channel.send({embeds: [new EmbedBuilder().setColor('Red').setDescription(`${canDivorce}`)]})

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setLabel("Accept").setCustomId("accept").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setLabel("Reject").setCustomId("reject").setStyle(ButtonStyle.Danger)
        );

        const embed = new EmbedBuilder()
        .setTitle("💔 Marriage Divorce 💔")
        .setDescription(`${divorcer} has proposed a divoce to ${partner}!\n\nAre you sure?`)
        .setFooter({text: 'You have 10 seconds to respond'});

        const m = await message.channel.send({ embeds: [embed], components: [row] });

        const confirmation = await divorce(divorcer, partner, m)

        if (confirmation.color === 'Green') {
            const marriage = marriageClass.divorce(divorcer, partner) 
            if (typeof marriage === 'string') {
                return message.channel.send(marriage)
            }
        }

        await m.reply({
            embeds: [
                new EmbedBuilder()
                .setColor(confirmation.color)
                .setDescription(confirmation.description),
            ],
        });

        m && m.deletable ? m.delete() : null;
        
    }
} as Command