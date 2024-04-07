import { ConfigInstance, CacheLoaderOptions } from "../ConfigHandler";
import { Guild, Client } from "discord.js";

/**
 * Class responsible for loading and updating cache.
 */
export class CacheLoader {
    /** 
     * Singleton instance of the CacheLoader class.
     */
    private static instance: CacheLoader | null = null;

    /**
     * Constructor for the CacheLoader class.
     * @param {ConfigInstance} instance - The configuration instance for the bot.
     * @param {CacheLoaderOptions[] | undefined} cacheLoaderOpts - Options for cache loading.
     */
    private constructor(instance: ConfigInstance, cacheLoaderOpts: CacheLoaderOptions[] | undefined) {
        // Emitting a messageCreate event with null content to trigger caching.
        this.emit(instance._client!);
        // Initial loading of cache and setting up periodic updates.
        this.bulk_loadcache(instance, cacheLoaderOpts);
        setInterval(() => this.bulk_loadcache(instance, cacheLoaderOpts), 120 * 1000);
    }

    /**
     * Retrieves the singleton instance of CacheLoader class.
     * @param {ConfigInstance} instance - The configuration instance for the bot.
     * @param {CacheLoaderOptions[] | undefined} cacheLoaderOpts - Options for cache loading.
     * @returns {CacheLoader} - The singleton instance of CacheLoader.
     */
    public static getInstance(instance: ConfigInstance, cacheLoaderOpts: CacheLoaderOptions[] | undefined): CacheLoader {
        return this.instance || (this.instance = new CacheLoader(instance, cacheLoaderOpts));
    }

    /**
     * Loads cache for specified options for all guilds.
     * @param {ConfigInstance} instance - The configuration instance for the bot.
     * @param {CacheLoaderOptions[] | undefined} cacheLoaderOpts - Options for cache loading.
     */
    private async bulk_loadcache(instance: ConfigInstance, cacheLoaderOpts: CacheLoaderOptions[] | undefined) {
        // Iterate over each guild in the client's cache.
        instance._client.guilds.cache.forEach(async (guild: Guild) => {
            // Iterate over each cache option.
            cacheLoaderOpts?.forEach(option => {
                // Fetch data for the cache option.
                guild[option]?.fetch?.();
            });
        });
    }

    /**
     * Emits a messageCreate event with null content to trigger cache loading.
     * @param {Client} client - The Discord client.
     */
    private emit(client: Client) {
        client.emit('messageCreate', { content: null } as any);
    }
}
