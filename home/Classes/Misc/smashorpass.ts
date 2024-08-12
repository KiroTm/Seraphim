// import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ButtonInteraction, InteractionReplyOptions, MessagePayload, Interaction, Collection, TextChannel, ComponentType, InteractionUpdateOptions, Message, ChannelType, Embed, ChatInputCommandInteraction } from 'discord.js';
// import { Utils } from '../../../Garnet/Utilities/Utils';
// import axios, { Axios, interceptors } from 'axios';
// export enum SmashOrPassThemes {
//     AnimeWomen = "aw",
//     Random = "r",
//     // RealMen = "rm",
//     RealWomen = "rw"
// }

// export interface ObjectItem {
//     api: string;
//     nsfwAvailable?: boolean;
//     config?: any;
// }

// export interface ApiObjectFunctionType {
//     [key: string]: {
//         nsfw?: ObjectItem[];
//         sfw: ObjectItem[];
//     };
// }

// export interface SmashOrPassData {
//     themes: Array<string>,
//     nsfw: string,
//     member: string,
//     anonymousVoting: boolean
// }

// export class SmashOrPass {

//     private participants = new Collection<string, Collection<string, string>>();
//     private voteCounts = new Collection<string, { smash: number; pass: number }>();

//     public Games: Collection<string, Collection<string, SmashOrPassData>> = new Collection()

//     public createGame(interaction: Interaction, data: SmashOrPassData) {
//         if (this.Games.has(interaction.guildId)) return "GAME_ALREADY_EXISTS"

//         const gameID = this.generateUniqueID(interaction.guildId) as string

//         this.Games.set(interaction.guildId, new Collection().set(gameID, data) as Collection<string, SmashOrPassData>)

//         return {
//             ...data,
//             id: gameID
//         }

//     }

//     public async startGame(interaction: ButtonInteraction, gameID: string) {

//         const data = this.Games.get(interaction.guildId).get(gameID);

//         if (!data) return this.update(interaction, { content: "This game does not exist, make a new one." });

//         const InteractionChannel = interaction.channel as TextChannel

//         const isChannelNSFW = InteractionChannel.nsfw

//         const MismatchType = (data.nsfw === 'true' && !isChannelNSFW)

//         if (MismatchType) return this.update(interaction, { content: "Set this as channel as NSFW to continue playing..." })

//         interaction.update({ components: [] }).catch(() => { })

//         if (!interaction.ephemeral) interaction.message.delete().catch(() => { })

//         const url = await this.fetchData(interaction, data).catch(() => {
//             InteractionChannel.send("Failed to get content, contact developer for help.");
//             return;
//         })

//         if (!url || !Utils.isValidURL(url)) return InteractionChannel.send({ content: "Failed to get content, contact developer for help." }).catch(() => { });

//         this.handleVotes(url, interaction);
//     }


//     private async handleVotes(url: string, interaction: ButtonInteraction) {
//         const gameID = interaction.message.embeds[0].footer.text.replace(/ /g, "").split("\n")[0].split(":")[1];
//         const gameData = this.getGameData(interaction)?.get(gameID);

//         if (!gameData) {
//             return interaction.channel.send({ content: "This game does not exist, please make a new one!" }).catch(() => { });
//         }

//         const SmashOrPassMessage = await (interaction.channel as TextChannel).send({
//             embeds: [
//                 new EmbedBuilder()
//                     .setTitle("Smash Or Pass!")
//                     .setColor('Blue')
//                     .setDescription(`Voting Started`)
//                     .setImage(url)
//                     .setFooter({ text: `Game ID: ${gameID}\nTheme(s): ${gameData.themes.join(" | ")}` })
//             ],
//             components: [createButtons(false)]
//         });

//         const collector = SmashOrPassMessage.createMessageComponentCollector({
//             componentType: ComponentType.Button,
//             time: 15000,
//         });

//         collector.on('collect', async (btnInteraction: ButtonInteraction) => {
//             try {
//                 const userId = btnInteraction.user.id;
//                 const guildId = btnInteraction.guildId;

//                 if (!guildId) return;

//                 const participants = this.participants.get(guildId) ?? new Collection<string, string>();
//                 const votes = this.voteCounts.get(guildId) ?? { smash: 0, pass: 0 };

//                 if (participants.has(userId)) {
//                     btnInteraction.reply({ content: "You have already voted!", ephemeral: true }).catch(() => { });
//                     return;
//                 }

//                 participants.set(userId, btnInteraction.customId);
//                 this.participants.set(guildId, participants);

//                 if (btnInteraction.customId === "SmashOrPassButton_Smash") votes.smash++;
//                 else votes.pass++;

//                 this.voteCounts.set(guildId, votes);

//                 await btnInteraction.deferUpdate().catch(() => { });
//             } catch (error) {
//                 console.error('Error handling vote:', error);
//             }
//         });

//         collector.on('end', async () => {
//             const guildId = interaction.guildId;
//             if (!guildId) return;

//             const data = this.Games.get(guildId)?.get(gameID);
//             const votes = this.voteCounts.get(guildId) ?? { smash: 0, pass: 0 };
//             const totalVotes = votes.smash + votes.pass;

//             let smashBlocks = Math.round((votes.smash / totalVotes) * 10);
//             let passBlocks = 10 - smashBlocks;

//             if (totalVotes === 0) {
//                 smashBlocks = 0;
//                 passBlocks = 0;
//             }

//             const generateVoters = (choice: string) =>
//                 [...this.participants.get(guildId)?.entries() || []]
//                     .filter(([_, vote]) => vote === choice)
//                     .map(([user]) => `<@${user}>`)
//                     .join(', ') || 'None';

//             const hasParticipants = this.participants.get(guildId)?.size > 0;

//             const fields = hasParticipants ? [
//                 { name: "Smash", value: data.anonymousVoting ? generateVoters("SmashOrPassButton_Smash") : "<Anonymous Voting>", inline: true },
//                 { name: "Pass", value: data.anonymousVoting ? generateVoters("SmashOrPassButton_Pass") : "<Anonymous Voting>", inline: true }
//             ] : [];

//             await SmashOrPassMessage.channel.send({
//                 content: `Voting has ended.`,
//                 embeds: [
//                     new EmbedBuilder(SmashOrPassMessage.embeds[0])
//                         .setFields([
//                             {
//                                 name: "Voting bar",
//                                 value: `${this.generateVotingBar(smashBlocks, passBlocks)}`
//                             },
//                             ...fields,
//                         ])
//                 ],
//                 components: [createButtons(true)]
//             });

//             this.participants.delete(guildId);
//             this.voteCounts.delete(guildId);

//             if (SmashOrPassMessage.deletable) await SmashOrPassMessage.delete().catch(() => { });

//         });

//     }

//     private async update(interaction: ButtonInteraction, data: InteractionUpdateOptions) {
//         await interaction.update(data)
//     }

//     private generateUniqueID(guildId: string): string {
//         const guildGames = this.Games.get(guildId) || new Collection<string, SmashOrPassData>();
//         let uniqueID: string;

//         do {
//             uniqueID = Utils.generateRandomAlphabeticID(5);
//         } while (guildGames.has(uniqueID));

//         return uniqueID;
//     }

//     public generateVotingBar(smash: number, pass: number): string {
//         const greenEmojis = [
//             "<:Green_Left_Full:1257255087248769046>",
//             "<:Green_Middle_Full:1257255074468466721>",
//             "<:Green_Middle_Full:1257255074468466721>",
//             "<:Green_Middle_Full:1257255074468466721>",
//             "<:Green_Middle_Full:1257255074468466721>",
//             "<:Green_Middle_Full:1257255074468466721>",
//             "<:Green_Middle_Full:1257255074468466721>",
//             "<:Green_Middle_Full:1257255074468466721>",
//             "<:Green_Middle_Full:1257255074468466721>",
//             "<:Green_Right_Full:1257255060526596187>",
//         ];

//         const redEmojis = [
//             "<:Red_Left_Full:1257255009960198207>",
//             "<:Red_Middle_Full:1257255026015862824>",
//             "<:Red_Middle_Full:1257255026015862824>",
//             "<:Red_Middle_Full:1257255026015862824>",
//             "<:Red_Middle_Full:1257255026015862824>",
//             "<:Red_Middle_Full:1257255026015862824>",
//             "<:Red_Middle_Full:1257255026015862824>",
//             "<:Red_Middle_Full:1257255026015862824>",
//             "<:Red_Middle_Full:1257255026015862824>",
//             "<:Red_Right_Full:1257255042814316564>",
//         ];

//         let emojiBar = "";
//         if (smash === 0 && pass === 0) {
//             emojiBar = "<:GreyLeftFull:1257351739137327174><:GreyMiddleFull:1257351741901635734><:GreyMiddleFull:1257351741901635734><:GreyMiddleFull:1257351741901635734><:GreyMiddleFull:1257351741901635734><:GreyMiddleFull:1257351741901635734><:GreyMiddleFull:1257351741901635734><:GreyMiddleFull:1257351741901635734><:GreyMiddleFull:1257351741901635734><:GreyRightFull:1257351744342462545>"
//         } else if (smash === 0) {
//             emojiBar = redEmojis.join("");
//         } else if (pass === 0) {
//             emojiBar = greenEmojis.join("");
//         } else {
//             for (let i = 0; i < smash; i++) {
//                 if (i === 0) {
//                     emojiBar += greenEmojis[0];
//                 } else {
//                     emojiBar += greenEmojis[1];
//                 }
//             }

//             for (let i = 0; i < pass; i++) {
//                 if (i === pass - 1) {
//                     emojiBar += redEmojis[redEmojis.length - 1];
//                 } else {
//                     emojiBar += redEmojis[1];
//                 }
//             }
//         }

//         return emojiBar;
//     }

//     public getGameData(interaction: Interaction) {
//         return this.Games.get(interaction.guildId) ?? undefined
//     }

//     private async fetchData(interaction: ButtonInteraction, data: SmashOrPassData) {

//         const { nsfw, themes } = data

//         const randomTheme = themes[Math.floor(Math.random() * themes.length)];

//         return (await this.get(interaction, randomTheme, nsfw) ?? undefined);
//     }

//     private async get(interaction: ButtonInteraction, randomTheme: string, nsfw: string): Promise<string> {
//         const themeUrls = ApiObjectFunction[randomTheme as keyof typeof ApiObjectFunction][nsfw === 'true' ? 'nsfw' : 'sfw'];
//         const randomObj = themeUrls[Math.floor(Math.random() * themeUrls.length)];

//         if (!randomObj) {
//             await this.update(interaction, { components: [], embeds: [], content: "No API for this theme has been set, contact the developer for help!" });
//             return undefined;
//         }

//         const { api } = randomObj;

//         if (randomObj.config) {
//             randomObj.config.params.page = Math.floor(Math.random() * 1000);
//         }

//         const request = await this.makeAxiosRequest(api, randomObj.config ?? null);

//         if (randomTheme === 'RealWomen') {
//             let isPostNsfw;
//             let attempts = 0;
//             const maxAttempts = 10;

//             do {
//                 isPostNsfw = request?.data?.[0]?.data.children?.[0]?.data?.over_18 === true;

//                 if (isPostNsfw && nsfw === 'false') {
//                     attempts++;
//                     const newRequest = await this.makeAxiosRequest(api, randomObj.config ?? null);
//                     interaction.channel.send("NSFW image detected! Fetching new image")
//                     request.data = newRequest.data;
//                 }
//             } while (isPostNsfw && nsfw === 'false' && attempts < maxAttempts);
//         }

//         const image = request.data?.[0]?.data?.children?.[0]?.data?.url
//             ?? request.data?.url
//             ?? request.data?.data[0]?.images?.jpg?.image_url

//         return image
//     }


//     private async makeAxiosRequest(query: string, params?: any) {
//         return (await axios.get(query, params ?? null))
//     }

//     public generateGameInfoEmbed(interaction: ChatInputCommandInteraction | ButtonInteraction, id: string): EmbedBuilder | 'GAME_NOT_FOUND' {
//         const game = this.getGameData(interaction).get(id)
        
//         if (!game) return 'GAME_NOT_FOUND'

//         return new EmbedBuilder()
//     }
// }

// export const ApiObjectFunction: ApiObjectFunctionType = {
//     AnimeWomen: {
//         sfw: [
//             {
//                 api: `https://api.waifu.pics/sfw/waifu`,
//             },
//             {
//                 api: `https://api.waifu.pics/sfw/neko`,
//             },
//             {
//                 api: `https://api.waifu.pics/sfw/shinobu`,
//             },
//             {
//                 api: `https://api.waifu.pics/sfw/megumin`,
//             },
//         ],
//         nsfw: [
//             {
//                 api: `https://api.waifu.pics/nsfw/waifu`,
//             },
//             {
//                 api: `https://api.waifu.pics/nsfw/neko`,
//             },
//             {
//                 api: `https://api.waifu.pics/nsfw/trap`,
//             },
//             {
//                 api: `https://api.waifu.pics/nsfw/blowjob`,
//             }
//         ]
//     },
//     Random: {
//         sfw: [
//             {
//                 api: "https://api.jikan.moe/v4/characters",
//                 config: {
//                     params: {
//                         page: Math.floor(Math.random() * 1000),
//                     }
//                 },
//             }
//         ]
//     },
//     RealWomen: {
//         sfw: [
//             {
//                 api: "https://www.reddit.com/r/reallygorgeous/random/.json",
//             }
//         ]
//     }
// };



// export const SmashOrPassEmbed_Main = new EmbedBuilder()
//     .setColor('Blue')
//     .setTitle("Smash OR Pass")
//     .setDescription("Welcome to the **Smash or Pass** game! Use this command to start a fun and interactive session where you can quickly decide if something is a 'Smash' or a 'Pass'.")
//     .setThumbnail("https://media.discordapp.net/attachments/1153223171072348172/1247616713860583505/P70Upzn.png");

// export const SmashOrPassActionRow_Buttons = new ActionRowBuilder<ButtonBuilder>({
//     components: [
//         new ButtonBuilder()
//             .setCustomId("SmashOrPassButton_Smash")
//             .setLabel("Smash")
//             .setEmoji("<:smash:1247618887856685066>")
//             .setStyle(ButtonStyle.Secondary),

//         new ButtonBuilder()
//             .setCustomId("SmashOrPassButton_Pass")
//             .setLabel("Pass")
//             .setEmoji("<:pass:1247618940117454980>")
//             .setStyle(ButtonStyle.Secondary)
//     ]
// });


// export const SmashOrPassThemesMap = Object.keys(SmashOrPassThemes).map((val) => {
//     return {
//         label: val,
//         value: SmashOrPassThemes[val]
//     };
// });


// export const SmashOrPassActionRow_Dropdown = new ActionRowBuilder<StringSelectMenuBuilder>({
//     components: [
//         new StringSelectMenuBuilder()
//             .setCustomId("SmashOrPassDropdown")
//             .setPlaceholder("Set theme")
//             .setMaxValues(Object.keys(SmashOrPassThemes).length)
//             .setMinValues(1)
//             .addOptions(SmashOrPassThemesMap)
//     ]
// })

// export const createButtons = (disabled: boolean) => (
//     new ActionRowBuilder<ButtonBuilder>({
//         components: [
//             new ButtonBuilder()
//                 .setCustomId("SmashOrPassButton_Smash")
//                 .setLabel("Smash")
//                 .setStyle(ButtonStyle.Primary)
//                 .setDisabled(disabled),
//             new ButtonBuilder()
//                 .setCustomId("SmashOrPassButton_Pass")
//                 .setLabel("Pass")
//                 .setStyle(ButtonStyle.Danger)
//                 .setDisabled(disabled),
//             new ButtonBuilder()
//                 .setCustomId("SmashOrPassBegin")
//                 .setLabel("New")
//                 .setStyle(ButtonStyle.Secondary)
//                 .setDisabled(!disabled)
//         ]
//     })
// );