import { ConfigInstance, CacheLoaderOptions } from "../ConfigHandler";
import { Guild, Client } from "discord.js";

export class CacheLoader {
    private static instance: CacheLoader | null = null;

    private constructor(instance: ConfigInstance, cacheLoaderOpts: CacheLoaderOptions[] | undefined) {
        this.emit(instance._client!)
        this.bulk_loadcache(instance, cacheLoaderOpts);
        setInterval(() => this.bulk_loadcache(instance, cacheLoaderOpts), 120 * 1000);
    }

    public static getInstance(instance: ConfigInstance, cacheLoaderOpts: CacheLoaderOptions[] | undefined): CacheLoader {
        return this.instance || (this.instance = new CacheLoader(instance, cacheLoaderOpts));
    }

    private async bulk_loadcache(instance: ConfigInstance, cacheLoaderOpts: CacheLoaderOptions[] | undefined) {
        instance._client.guilds.cache.forEach(async (guild: Guild) => {
            cacheLoaderOpts?.forEach(option => {
                guild[option]?.fetch?.();
            });
        });
    }

    private emit(client: Client) {
        client.emit('messageCreate', { content: null } as any)
    }

}
