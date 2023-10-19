import { Collection, Guild, GuildMember, Message, User } from "discord.js";
import StatsSchema from "../../models/StatsSchema";
import { ChannelClass } from "./channel";

export class StatsClass {
    private static instance: StatsClass;
    private statsData: Collection<string, Collection<string, Collection<string, string>>> = new Collection();

    private constructor() {
        this.initializeStatsData().then(() => {
            this.setupPeriodicUpdates()
        });
    }

    public static getInstance(): StatsClass {
        return this.instance || (this.instance = new StatsClass());
    }

    public add(message: Message) {
        const guildId = message.guild?.id;
        const userId = message.author.id;
        const messageId = `${message.id}-${message.createdTimestamp}`;
        const timestamp = message.createdTimestamp;
        const channelId = message.channelId
        if (!guildId || !userId || !messageId || !timestamp || !channelId) {
            return;
        }

        if (!this.statsData.has(guildId)) {
            this.statsData.set(guildId, new Collection<string, Collection<string, string>>());
        }

        if (!this.statsData.get(guildId)?.has(userId)) {
            this.statsData.get(guildId)?.set(userId, new Collection<string, string>());
        }

        this.statsData.get(guildId)?.get(userId)?.set(messageId, `${channelId}-${timestamp}`);
    }

    getTopMembers(guild: Guild, count = 10) {
        const membersArray = Array.from(guild.members.cache.values());

        const topMembers = membersArray.reduce<{ value: Collection<string, string>; member: GuildMember }[]>(
            (result, guildmember) => {
                const guildData = this.statsData.get(guild.id);
                if (guildData) {
                    const userData = guildData.get(guildmember.id);
                    if (userData) {
                        result.push({ value: userData, member: guildmember });
                    }
                }
                return result;
            },
            []
        );

        topMembers.sort((a, b) => b.value.size - a.value.size);

        return topMembers.slice(0, count);
    }



    public getStats(guildId: string, userId: string): Collection<string, string> | undefined {
        const guildData = this.statsData.get(guildId);
        if (!guildData) return undefined;
        return guildData.get(userId);
    }

    public getMessages(guild: Guild, userId: string): Record<string, Collection<string, string>> {
        const guildId = guild.id;
        const userCollection = this.statsData.get(guildId)?.get(userId);

        if (!userCollection) {
            return {
                "7days": new Collection<string, string>(),
                "3days": new Collection<string, string>(),
                "1day": new Collection<string, string>(),
                "alltime": new Collection<string, string>(),
            };
        }

        const now = Date.now();
        const timeFrames: Record<string, number> = {
            "7days": 7 * 24 * 60 * 60 * 1000,
            "3days": 3 * 24 * 60 * 60 * 1000,
            "1day": 1 * 24 * 60 * 60 * 1000,
            "alltime": 0,
        };

        const messages: Record<string, Collection<string, string>> = {
            "7days": new Collection<string, string>(),
            "3days": new Collection<string, string>(),
            "1day": new Collection<string, string>(),
            "alltime": new Collection<string, string>(),
        };

        Object.keys(timeFrames).forEach((timeframe) => {
            userCollection.forEach((timestampChannel: string, messageId: string) => {
                const [channelId, messageTimestamp] = timestampChannel.split('-');
                const timestamp = parseInt(messageTimestamp);
                if (timestamp >= now - timeFrames[timeframe]) {
                    messages[timeframe].set(messageId, channelId);
                }
            });
        });

        return messages;
    }

    public getChannels(guild: Guild, userId: string): [Collection<number, string>, Collection<string, number>] {
        const guildId = guild.id;
        const userCollection = this.statsData.get(guildId)?.get(userId);

        if (!userCollection) {
            return [new Collection<number, string>(), new Collection<string, number>()];
        }

        const channelCounts = new Collection<string, number>();

        userCollection.forEach((timestampChannel: string, _) => {
            const [channelId, __] = timestampChannel.split('-');

            if (channelCounts.has(channelId)) {
                channelCounts.set(channelId, channelCounts.get(channelId)! + 1);
            } else {
                channelCounts.set(channelId, 1);
            }
        });

        const sortedChannels = [...channelCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)
        const indexedChannels = new Collection<number, string>();
        sortedChannels.forEach((entry, index) => {
            indexedChannels.set(index + 1, entry[0]);
        });

        return [indexedChannels, channelCounts];
    }





    private async initializeStatsData() {
        const statsDocuments = await StatsSchema.find();
        for (const statsDocument of statsDocuments) {
            const guildId = statsDocument.GuildID;
            const guildCollection: Collection<string, Collection<string, string>> = new Collection();
            for (const message of statsDocument.Collection) {
                const userId = message.UserID;
                const messageId = message.MessageId;
                const timestamp = message.Date;
                const channelId = message.ChannelId
                if (!guildCollection.has(userId)) {
                    guildCollection.set(userId, new Collection<string, string>());
                }
                guildCollection.get(userId)?.set(messageId, `${channelId}-${timestamp}`);
            }

            this.statsData.set(guildId, guildCollection);
        }
    }

    private uploadStatsDataToMongoose() {
        if (!this.statsData.size) return;

        this.statsData.forEach(async (guildCollection, guildId) => {
            const messageDataArray: any[] = [];

            guildCollection.forEach((userCollection, userId) => {
                userCollection.forEach((timestampChannel: string, messageId: string) => {
                    const value = timestampChannel.split('-')
                    const messageData = {
                        UserID: userId,
                        MessageId: messageId,
                        ChannelId: value[0],
                        Date: value[1],
                    };
                    messageDataArray.push(messageData);
                });
            });

            await StatsSchema.findOneAndUpdate(
                { GuildID: guildId },
                { GuildID: guildId, Collection: messageDataArray },
                { upsert: true, new: true }
            );
        });
    }

    private setupPeriodicUpdates() {
        this.uploadStatsDataToMongoose();
        console.log(`Downloaded Stats Data!\n↳Loaded for ${this.statsData.size} guilds.`)
        setInterval(() => {
            this.uploadStatsDataToMongoose();
        }, 20 * 1000);
    }
}
