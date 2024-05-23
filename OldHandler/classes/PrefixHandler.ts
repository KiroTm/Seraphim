import { ConfigInstance } from "../ConfigHandler";
import PrefixSchema from "../models/PrefixSchema";
import { Collection } from "discord.js";

/**
 * Class responsible for managing prefixes for guilds.
 */
export class PrefixHandler {
    /** 
     * Singleton instance of the PrefixHandler class. 
     */
    private static instance: PrefixHandler | null = null;
    /** 
     * Default prefix used when a guild-specific prefix is not set. 
     */
    private defaultPrefix: string | null = null
    /** 
     * Collection of guild-specific prefixes. 
     */
    private prefixes = new Collection<string, string>();

    /**
     * Constructs a new instance of the PrefixHandler class.
     * @param {ConfigInstance} _: The configuration instance for the bot.
     */
    private constructor(_: ConfigInstance) {
        this.setupPeriodicUpdates();
    }

    /**
     * Retrieves the singleton instance of the PrefixHandler class.
     * @param {ConfigInstance} instance - The configuration instance for the bot.
     * @returns {PrefixHandler} - The singleton instance of the PrefixHandler class.
     */
    public static getInstance(instance: ConfigInstance): PrefixHandler {
        return this.instance || (this.instance = new PrefixHandler(instance));
    }

    /**
     * Sets a custom prefix for a guild.
     * @param {string} key - The guild ID for which to set the prefix.
     * @param {string} prefix - The custom prefix to set.
     */
    public setPrefix(key: string, prefix: string): void {
        this.prefixes.set(key, prefix);
        this.uploadPrefix(key, prefix);
    }

    /**
     * Retrieves the prefix for a guild.
     * @param {string} key - The guild ID for which to retrieve the prefix.
     * @returns {string} - The prefix for the guild.
     */
    public getPrefix(key: string): string {
        return (this.prefixes.get(key) ?? this.defaultPrefix)!;
    }

    /**
     * Retrieves the default prefix used when a guild-specific prefix is not set.
     * @returns {string | null} - The default prefix.
     */
    public getDefaultPrefix(): string | null {
        return this.defaultPrefix;
    }

    /**
     * Sets the default prefix used when a guild-specific prefix is not set.
     * @param {string} prefix - The default prefix to set.
     */
    public setDefaultPrefix(prefix: string): void {
        this.defaultPrefix = prefix;
    }

    /**
     * Fetches guild-specific prefixes from the database.
     */
    private async fetchPrefixes(): Promise<void> {
        const Prefixes = await PrefixSchema.find();
        Prefixes.forEach(({ GuildID, Prefix }) => this.prefixes.set(GuildID, Prefix));
    }

    /**
     * Uploads guild-specific prefixes to the database.
     * @param {string} guildID - The guild ID for which to upload the prefix.
     * @param {string} prefix - The prefix to upload.
     */
    private async uploadPrefix(guildID: string, prefix: string): Promise<void> {
        await PrefixSchema.findOneAndUpdate(
            { GuildID: guildID },
            { GuildID: guildID, Prefix: prefix },
            { upsert: true, new: true }
        );
    }

    /**
     * Sets up periodic updates to synchronize guild-specific prefixes with the database.
     */
    private async setupPeriodicUpdates(): Promise<void> {
        await this.fetchPrefixes();
        setInterval(() => {
            this.prefixes.forEach((prefix, guildID) => this.uploadPrefix(guildID, prefix));
        }, 1000 * 10); // Update prefixes every 10 seconds
    }
}
