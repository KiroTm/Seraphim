import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ComponentType, EmbedBuilder, GuildMember, Interaction, Message, TextChannel } from "discord.js";
import { Callback, Command } from "../../typings";
async function Proposal(a: GuildMember, b: GuildMember, message: Message) {
    const collector = message.createMessageComponentCollector({ filter: (i: ButtonInteraction) => i.user.id === b.id, time: 10000, componentType: ComponentType.Button });

    return new Promise<boolean>((resolve) => {
        collector.on('collect', (i: ButtonInteraction) => {
            i.deferUpdate()
            resolve(i.customId === 'accept')
        });

        collector.on('end', (collected, reason) => {
            message.edit({ components: [] }).catch(() => null);
            if (reason === 'time') return resolve(false)
        })
    })
}
export default {
    name: 'marry',
    description: 'Marry a person.',
    callback: async ({ client, message, args }: Callback) => {
        const p = (message.mentions.members?.first() || message.guild?.members.cache.get(args[0] ?? undefined) || undefined)
        const a = message.member || undefined
        if (!p || !a) return message.channel.send("Invalid member!")
        if (p.user.bot) return message.channel.send("Bots cannot participate in marriages")
        if (p.id === a.id) return message.channel.send("You cannot do that!")
        const r = new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setLabel('Accept').setCustomId(`accept`).setStyle(ButtonStyle.Primary), new ButtonBuilder().setLabel('Reject').setStyle(ButtonStyle.Danger).setCustomId('reject'))
        const e = new EmbedBuilder().setTitle('💍 Marriage Proposal 💍').setDescription(`${a} has proposed to ${p}!\n\nDo you accept the proposal?`).setColor('Blue');
        const m = await message.channel.send({ embeds: [e], components: [r] });
        const confirmation = await Proposal(a, p, m)
        await m.reply({
            embeds: [
                new EmbedBuilder()
                .setColor(confirmation ? 'Green' : 'Red')
                .setDescription(confirmation ? `${a} and ${p} are now married!` : `${a}'s proposal  has been rejected by ${p}!`)
            ]
        })
        m.delete()
    }
} as Command






// import { Callback, Command } from "../../typings";
// import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, EmbedData, GuildMember, Interaction, TextChannel } from 'discord.js';

// async function createConfirmationModal(proposer: GuildMember, target: GuildMember, channel: TextChannel): Promise<boolean> {
//     const row = new ActionRowBuilder<ButtonBuilder>()
//         .addComponents(
//             new ButtonBuilder()
//                 .setCustomId('accept')
//                 .setLabel('Accept')
//                 .setStyle(ButtonStyle.Primary),
//             new ButtonBuilder()
//                 .setCustomId('reject')
//                 .setLabel('Reject')
//                 .setStyle(ButtonStyle.Danger)
//         );

//     const embed = new EmbedBuilder()
//         .setTitle('💍 Marriage Proposal 💍')
//         .setDescription(`${proposer} has proposed to ${target}!\n\nDo you accept the proposal?`)
//         .setColor('Blue');

//     const message = await channel.send({ embeds: [embed], components: [row] });

//     const filter = (interaction: Interaction) => {
//         return interaction.isButton() && ['accept', 'reject'].includes(interaction.customId) && interaction.user.id === target.id;
//     };

//     const collector = message.createMessageComponentCollector({ filter, time: 10000 });

//     return new Promise<boolean>((resolve) => {
//         collector.on('collect', (interaction: ButtonInteraction) => {
//             collector.stop();
//             resolve(interaction.customId === 'accept');
//         });

//         collector.on('end', () => {
//             message.edit({ components: [] }).catch(() => null);
//             resolve(false);
//         });
//     });
// }

// export default {
//     name: 'marry',
//     description: 'Propose for marriage',
//     cooldown: { Duration: '2s', Type: 'perUserCooldown', CustomCooldownMessage: "If only these marriages were real... But they're not, calm down." },
//     callback: async ({ message, args }: Callback) => {
//         const v = args.length;
//         let proposer: GuildMember | undefined;
//         let target: GuildMember | undefined;

//         if (!v) {
//             proposer = message.member as GuildMember;
//             target = message.guild?.members.cache.random() as GuildMember;
//         } else if (v === 1) {
//             proposer = message.member as GuildMember;
//             target = message.mentions.members?.first() as GuildMember;
//         } else {
//             proposer = message.member as GuildMember;
//             target = message.mentions.members?.first() as GuildMember || Array.from(message.mentions.members!)[1]?.[1] as GuildMember;
//         }

//         if (!proposer || !target) {
//             return message.channel.send('Invalid usage of the command.');
//         }

//         const confirmation = await createConfirmationModal(proposer, target, message.channel as TextChannel);

//         if (confirmation) {
//             const lovePercentage = calculateLovePercentage(proposer.user.username, target.user.username);

//             const embed = new EmbedBuilder()
//                 .setTitle('💍 Marriage Proposal Accepted 💍')
//                 .setDescription(`${proposer} and ${target} are now married!\n\n💖 **Love Percentage:** ${lovePercentage}%`)
//                 .setColor("Blue");

//             message.channel.send({ embeds: [embed] });
//         } else {
//             message.channel.send(`💔 ${proposer} and ${target}'s marriage proposal has been rejected.`);
//         }
//     }
// } as Command;
