import { Callback, Command } from "../../typings";

export default {
    name: 'marry',
    description: 'Marry a person.',
    callback: async ({ client, message, args }: Callback) => {
    }
} as Command






// import { Callback, Command } from "../../typings";
// import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, EmbedData, GuildMember, Interaction, TextChannel } from 'discord.js';

// function calculateLovePercentage(name1: string, name2: string): number {
//     const hash1 = hash(name1);
//     const hash2 = hash(name2);
//     return Math.abs((hash1 + hash2) % 101);
// }

// function hash(s: string): number {
//     let h = 0;
//     for (let i = 0; i < s.length; i++) {
//         const char = s.charCodeAt(i);
//         h = (h << 5) - h + char;
//         h = h & h;
//     }
//     return h;
// }

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
