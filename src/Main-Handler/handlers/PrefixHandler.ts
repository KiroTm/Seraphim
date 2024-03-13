import { Collection } from "discord.js";
import { ConfigInstance } from "../ConfigHandler";
import PrefixSchema from "../models/PrefixSchema";

export class PrefixHandler {
    private static instance: PrefixHandler | null = null;
    private prefixes = new Collection<string, string>();

    private constructor(instance: ConfigInstance) {
        this.setupPeriodicUpdates();
    }

    public static getInstance(instance: ConfigInstance): PrefixHandler {
        return this.instance || (this.instance = new PrefixHandler(instance));
    }

    public setPrefix(key: string, prefix: string): void {
        this.prefixes.set(key, prefix);
        this.uploadPrefix(key, prefix);
    }

    public getPrefix(key: string): string | undefined {
        return this.prefixes.get(key);
    }

    private async fetchPrefixes(): Promise<void> {
        const Prefixes = await PrefixSchema.find();
        Prefixes.forEach(({ GuildID, Prefix }) => this.prefixes.set(GuildID, Prefix));
    }

    private async uploadPrefix(guildID: string, prefix: string): Promise<void> {
        await PrefixSchema.findOneAndUpdate(
            { GuildID: guildID },
            { GuildID: guildID, Prefix: prefix },
            { upsert: true, new: true }
        );
    }

    private async setupPeriodicUpdates(): Promise<void> {
        await this.fetchPrefixes();
        setInterval(() => {
            this.prefixes.forEach((prefix, guildID) => this.uploadPrefix(guildID, prefix));
        }, 1000 * 10);
    }
}
