import { Collection, Message } from "discord.js";
import AfkSchema from "../../models/Afk-Schema";

type AfkObject = {
    Reason: string
    Timestamp: number
    Mentions?: Array<string>
};

export class AfkClass {
    private afks = new Collection<string, AfkObject>();
    private static instance: AfkClass;

    private constructor() {
        this.initializeAfkData().then(() => this.setupPeriodicUpdates())
    }

    public static getInstance(): AfkClass {
        return this.instance || (this.instance = new AfkClass());
    }

    public findOne(key: string): AfkObject | undefined {
        return this.afks.get(key);
    }

    public find(): Collection<string, AfkObject> {
        return this.afks
    }

    public findOneAndDelete(key: string): AfkObject | undefined {
        const afk = this.afks.get(key);
        if (afk) {
            this.afks.delete(key);
        }
        return afk;
    }

    public create(key: string, value: AfkObject): void {
        this.afks.set(key, value);
    }

    public deleteOne(key: string): void {
        this.afks.delete(key);
    }

    private async initializeAfkData() {
        const afks = await AfkSchema.find();
        for (const afk of afks) {
            const key = `${afk.UserID}-${afk.GuildID}`;
            const object: AfkObject = {
                Reason: afk.Reason,
                Timestamp: afk.createdAt,
                Mentions: afk.Mentions || []
            };
            this.afks.set(key, object);
        }
    }

    private async uploadAfkDataToMongoose() {
        if (this.afks.size == 0) return;
        try {
            await AfkSchema.deleteMany({});
            this.afks.forEach((afkObject, key) => {
                const mentions = afkObject.Mentions || []
                const split = key.split('-')
                const userId = split[0]
                const guildId = split[1]
                AfkSchema.create({
                    UserID: userId,
                    GuildID: guildId,
                    Reason: afkObject.Reason,
                    Mentions: mentions,
                    createdAt: afkObject.Timestamp
                })
            })
        } catch (error) {
            console.error('Error uploading AFK data to Mongoose', error);
        }
    }

    private setupPeriodicUpdates() {
        this.uploadAfkDataToMongoose();
        setInterval(() => {
            this.uploadAfkDataToMongoose();
        }, 10 * 1000);
    }
}