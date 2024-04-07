import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ColorResolvable, ComponentType, EmbedBuilder, GuildMember, Message } from "discord.js";
import { Callback, Command } from "../../../../Main-Handler/typings";
import { MarriageClass } from "../../../Classes/Misc/marriage";
const marriageClass = MarriageClass.getInstance();
async function proposal(a: GuildMember, b: GuildMember, message: Message): Promise<{ description: string, color: ColorResolvable }> {
    const collector = message.createMessageComponentCollector({
        filter: (i: ButtonInteraction) => i.user.id === b.id,
        time: 10000,
        componentType: ComponentType.Button
    });

    return new Promise<{ description: string, color: ColorResolvable }>((resolve) => {
        collector.on("collect", (i: ButtonInteraction) => {
            collector.stop(i.customId)
        });

        collector.on("end", (collected, reason) => {
            message.edit({ components: [] }).catch(() => null);
            return resolve(
                reason === 'accept' ? { description: `${a} and ${b} are now married!`, color: 'Green' } :
                    reason === 'reject' ? { description: `${b} rejected ${a}'s proposal..`, color: 'Red' } :
                        reason === 'time' ? { description: `${b} didn't respond in time!`, color: 'Red' } :
                            { description: 'Error, something went wrong.', color: 'Red' }
            )
        });
    });
}

export default {
    name: "marry",
    description: "Marry a person.",
    cooldown: {
        Duration: '15s',
        Type: 'perUserCooldown'
    },
    callback: async ({ message, args }: Callback) => {
        const partner = message.mentions.members?.first() || message.guild?.members.cache.get(args[0] as string) || undefined
        const proposer = message.member || undefined

        if (!proposer || !partner || proposer.user.bot || proposer.id === partner.id) {
            return message.channel.send({ embeds: [new EmbedBuilder().setColor('Blue').setDescription('You cannot marry them!')] })
        }

        const result = marriageClass.canMarry(proposer, partner);

        if (typeof result === "string") {
            return message.channel.send({ embeds: [new EmbedBuilder().setColor('Red').setDescription(`${result}`)] });
        }

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setLabel("Accept").setCustomId("accept").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setLabel("Reject").setCustomId("reject").setStyle(ButtonStyle.Danger)
        );

        const embed = new EmbedBuilder()
            .setTitle("💍 Marriage Proposal 💍")
            .setDescription(`${proposer} has proposed to ${partner}!\n\nDo you accept the proposal?`)
            .setFooter({ text: 'You have 10 seconds to respond' });

        const m = await message.channel.send({ embeds: [embed], components: [row] });
        const confirmation = await proposal(proposer, partner, m);

        if (confirmation.color === 'Green') {
            const marriage = marriageClass.marry(proposer, partner)
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
    },
    extraInfo: {
        command_usage: "{PREFIX} marry @user",
        command_example: "{PREFIX} marry @JohnDoe",
        command_detailedExplaination: "This command allows a user to propose marriage to another user mentioned in the server. If the proposed user accepts the proposal within 10 seconds, they will be married. If the proposed user rejects the proposal or doesn't respond in time, appropriate messages will be displayed. The command has a cooldown of 15 seconds per user."
    }

} as Command;
