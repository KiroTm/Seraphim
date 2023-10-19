import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, Collection, ComponentType, EmbedBuilder, Guild, GuildMember, Message, TextChannel } from "discord.js";
import DropSchema from "../../models/Drop-Schema";
import { client } from "../..";

export class DropClass {
    private static instance: DropClass;
    public DropsSetupData: Collection<string, string> = new Collection();
    public DropsData: Collection<string, Collection<string, number>> = new Collection();
    public isBlackListed: Set<string> = new Set();
    private constructor() {
        this.initializeDropsData().then(() => {
            this.startUp();
        });
    }

    public static getInstance(): DropClass {
        return this.instance || (this.instance = new DropClass());
    }

    private shouldSendDrop(channel: TextChannel): boolean {
        const recentMessagesWithinTimeFrame = channel.messages.cache.filter(({ createdTimestamp }) => { const timeDifference = Date.now() - createdTimestamp; return timeDifference < 84 * 1000 });
        return recentMessagesWithinTimeFrame.size >= 5;
    }

    private async sendDrops(checkActivity?: boolean) {
        if (!this.DropsSetupData) return;
        const check = checkActivity || false;
        this.DropsSetupData.forEach(async (drop_value, drop_key) => {
            const guild = client.guilds.cache.get(drop_key) as Guild | undefined;

            if (!guild) return;

            const channel = client.channels.cache.get(drop_value);

            if (!channel || !channel.isTextBased()) return;

            if (check && !this.shouldSendDrop(channel as TextChannel)) return;

            const Embed = new EmbedBuilder()
                .setColor('#2b2d32')
                .setDescription(`A mystery drop appeared!`)
                .setImage(`https://i.imgur.com/BLtdF0M.png`)
                .setTitle("Halloween Drops");

            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`${guild.id}-${channel.id}`)
                        .setLabel('Collect')
                        .setStyle(ButtonStyle.Success)
                );
            const response = await channel.send({
                embeds: [Embed],
                components: [row]
            });

            const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, max: 1, maxUsers: 2, time: 10000 });

            collector.on('collect', async (int: ButtonInteraction) => {
                int.deferUpdate()
            });

            collector.on('end', async (int, reason) => {
                if (reason == 'time') {
                    response.edit({ embeds: [Embed.setColor('Red').addFields({ name: "Collectors:", value: "None", inline: false })], components: [] });
                    setTimeout(async () => {
                        response.delete().catch(() => { })
                        return;
                    }, 1000 * 5);
                }
                if (int.size) {
                    const interaction = int.values().next().value as ButtonInteraction
                    const [guildId, channelId] = interaction.customId.split('-');
                    const crate_name = this.pickRandomDrop()
                    const crate = dropTypes[crate_name]
                    const collection = this.DropsSetupData.get(guildId);
                    if (!collection || collection !== channelId) return;
                    const member = interaction.member as GuildMember;
                    if (this.isBlackListed.has(member.id)) return;
                    const field = { name: "Collectors", value: `${Embed.data.fields ? `${Embed.data.fields.map((value) => `${value.value}`).join()}\n` : ""}  ${member}`, inline: false }
                    interaction.message.edit({
                        embeds: [Embed.setFields(field).setImage(crate.image).setDescription(`The mystery drop was: ${crate_name}`)],
                        components: []
                    });
                    const m = this.DropsData.get(member.id);
                    const memberInfo: Collection<string, number> = new Collection();
                    m ? m.set(crate_name, (m.get(crate_name) || 0) + 1) : this.DropsData.set(member.id, memberInfo.set(crate_name, 1));
                    setTimeout(() => {
                        interaction.message.delete().catch(() => { });
                    }, 1000 * 6);
                }
            });
        });
    }

    private pickRandomDrop(): keyof typeof dropTypes {
        const weightedRarities: (keyof typeof dropTypes)[] = [];

        for (const rarity in dropTypes) {
            if (Object.prototype.hasOwnProperty.call(dropTypes, rarity)) {
                for (let i = 0; i < dropTypes[rarity as keyof typeof dropTypes].weight; i++) {
                    weightedRarities.push(rarity as keyof typeof dropTypes);
                }
            }
        }

        const randomIndex = Math.floor(Math.random() * weightedRarities.length);
        return weightedRarities[randomIndex];
    }

    private async initializeDropsData() {
        const dropSetups = await DropSchema.find();

        for (const dropSetup of dropSetups) {
            const { GuildID, ChannelID, ItemCollection } = dropSetup;
            this.DropsSetupData.set(GuildID, ChannelID);

            ItemCollection.forEach((itemData: any) => {
                const { UserID, Crates } = itemData;
                const itemMap = new Collection<string, number>();

                Crates.forEach((crate: any) => {
                    itemMap.set(crate.name, crate.amount);
                });

                this.DropsData.set(UserID, itemMap);
            });
        }
    }

    private async uploadDropsDataToMongoDbAndIdkIWantToMakeThisLongAsFuck() {
        const DropSetups = this.DropsSetupData
        const DropCollections = this.DropsData
        if (!DropSetups.size) return;
        if (!DropCollections || !DropCollections.size) return;
        const ArrayToUpload = DropSetups.map((channelID, guildID) => {
            return {
                GuildID: guildID,
                ChannelID: channelID,
                ItemCollection: DropCollections.map((value, key) => {
                    return {
                        UserID: key,
                        Crates: value.map((value, key) => {
                            return {
                                name: key,
                                amount: value
                            }
                        })
                    }
                })
            }
        })
        ArrayToUpload.forEach(async (guild) => {
            await DropSchema.findOneAndUpdate({ GuildID: guild.GuildID }, guild, { upsert: true, new: true })
        })
    }

    public trigger() {
        this.sendDrops(false);
    }

    private startUp() {
        this.sendDrops(true);
        setInterval(() => {
            this.sendDrops(true)
            this.uploadDropsDataToMongoDbAndIdkIWantToMakeThisLongAsFuck();
        }, 60000);
    }
}



export const dropTypes: Record<string, { image: string, description: string, weight: number, emoji: string }> = {
    Mythic: {
        image: 'https://i.imgur.com/Wq756bZ.png',
        description: 'A crate with mythic items.',
        weight: 1,
        emoji: "<:crate_mythic:1162792060110245979>"
    },
    Rare: {
        image: "https://i.imgur.com/cJqMcyq.png",
        description: "A crate with rare items.",
        weight: 10,
        emoji: "<:crate_rare:1162792090451853383>",
    },
    Uncommon: {
        image: 'https://i.imgur.com/M5xKemu.png',
        description: 'A crate with gold items',
        weight: 30,
        emoji: "<:crate_uncommon:1162792140456333453>",
    },
    Common: {
        image: 'https://i.imgur.com/ZYB2r1f.png',
        description: 'A crate with common items.',
        weight: 60,
        emoji: "<:crate_common:1162792170277834792>",
    },
}