import { Collection, Guild, GuildMember, Message, User } from 'discord.js';
import StatsSchema from '../../../src/models/StatsSchema';
export class StatsClass {
    private static instance: StatsClass;
    private statsData: Collection<string, Collection<string, Collection<string, string>>> = new Collection();
    private lookbacks: Collection<string, number> = new Collection()
    private constructor() {
        this.initializeStatsData().then(() => {
            this.setupPeriodicUpdates();
        });
    }

    public static getInstance(): StatsClass {
        return this.instance || (this.instance = new StatsClass());
    }

    public setLookback(guild: Guild, lookback: number) {
        this.lookbacks.set(guild.id, lookback)
    }

    public add(message: Message) {
        const guildId = message.guild?.id;
        const userId = message.author.id;
        const messageId = `${message.id}-${message.createdTimestamp}`;
        const timestamp = message.createdTimestamp;
        const channelId = message.channelId;

        if (!guildId || !userId || !messageId || !timestamp || !channelId) {
            return;
        }

        const guildData = this.statsData.get(guildId) ?? new Collection();
        const userData = guildData.get(userId) ?? new Collection();
        this.lookbacks.get(guildId) ?? this.lookbacks.set(guildId, 7)

        userData.set(messageId, `${channelId}-${timestamp}`);
        guildData.set(userId, userData);
        this.statsData.set(guildId, guildData);
    }

    getTopMembers(guild: Guild, count = 10) {
        const membersArray = Array.from(guild.members.cache.values());
        const topMembers = membersArray.reduce<{ value: Collection<string, string>; member: GuildMember }[]>(
            (result, guildMember) => {
                const guildData = this.statsData.get(guild.id);
                const userData = guildData?.get(guildMember.id);
                if (userData) {
                    result.push({ value: userData, member: guildMember });
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
        return guildData?.get(userId);
    }

    public getMessages(guild: Guild, userId: string): Record<string, Collection<string, string>> {
        const guildId = guild.id;
        const userCollection = this.statsData.get(guildId)?.get(userId);

        const timeFrames: Record<string, number> = {
            '7days': 7 * 24 * 60 * 60 * 1000,
            '3days': 3 * 24 * 60 * 60 * 1000,
            '1day': 1 * 24 * 60 * 60 * 1000,
            'alltime': 0,
        };

        const now = Date.now();

        const messages: Record<string, Collection<string, string>> = {
            '7days': new Collection<string, string>(),
            '3days': new Collection<string, string>(),
            '1day': new Collection<string, string>(),
            'alltime': new Collection<string, string>(),
        };

        Object.keys(timeFrames).forEach((timeframe) => {
            userCollection?.forEach((timestampChannel: string, messageId: string) => {
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

        const channelCounts = new Collection<string, number>();

        userCollection?.forEach((timestampChannel: string) => {
            const [channelId, _] = timestampChannel.split('-');
            channelCounts.set(channelId, (channelCounts.get(channelId) ?? 0) + 1);
        });

        const sortedChannels = [...channelCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
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
            const lookback: number = statsDocument.Lookback
            for (const message of statsDocument.Collection) {
                const userId = message.UserID;
                const messageId = message.MessageId;
                const timestamp = message.Date;
                const channelId = message.ChannelId;
                const userCollection = guildCollection.get(userId) ?? new Collection();
                userCollection.set(messageId, `${channelId}-${timestamp}`);
                guildCollection.set(userId, userCollection);
            }
            this.lookbacks.set(guildId, lookback)
            this.statsData.set(guildId, guildCollection);
        }
    }

    private async uploadStatsDataToMongoose() {
        if (!this.statsData.size) return;
        this.statsData.forEach(async (guildCollection, guildId) => {
            const messageDataArray: any[] = [];
            const lookback = this.lookbacks.get(guildId)
            guildCollection.forEach((userCollection, userId) => {
                userCollection.forEach((timestampChannel: string, messageId: string) => {
                    const value = timestampChannel.split('-');
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
                { GuildID: guildId, Collection: messageDataArray, Lookback: lookback ?? 7 },
                { upsert: true, new: true }
            );
        });
    }

    private setupPeriodicUpdates() {
        this.uploadStatsDataToMongoose();
        setInterval(() => {
            this.uploadStatsDataToMongoose();
        }, 20 * 1000);
    }
}
