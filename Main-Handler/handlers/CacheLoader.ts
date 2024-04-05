import { Client, Guild } from "discord.js";
import { ConfigInstance, CacheLoaderOptions } from "../ConfigHandler";

export class CacheLoader {
    private static instance: CacheLoader | null = null;
    private timer: NodeJS.Timeout | null = null;

    private constructor(instance: ConfigInstance, cacheLoaderOpts: CacheLoaderOptions[] | undefined) {
        this.emit(instance);
        this.bulk_loadcache(instance, cacheLoaderOpts);
        this.timer = setInterval(() => this.bulk_loadcache(instance, cacheLoaderOpts), 120 * 1000);
    }

    public static getInstance(instance: ConfigInstance, cacheLoaderOpts: CacheLoaderOptions[] | undefined): CacheLoader {
        return this.instance || (this.instance = new CacheLoader(instance, cacheLoaderOpts));
    }

    private async bulk_loadcache(instance: ConfigInstance, cacheLoaderOpts: CacheLoaderOptions[] | undefined) {
        const client = instance._client as Client;
        client.guilds.cache.forEach(async (guild: Guild) => {
            if (cacheLoaderOpts?.includes(CacheLoaderOptions.Members)) {
                guild.members.fetch();
            }

            if (cacheLoaderOpts?.includes(CacheLoaderOptions.Roles)) {
                guild.roles.fetch();
            }

            if (cacheLoaderOpts?.includes(CacheLoaderOptions.Channels)) {
                guild.channels.fetch();
            }

            if (cacheLoaderOpts?.includes(CacheLoaderOptions.Bans)) {
                guild.bans.fetch();
            }
        });
    }

    private emit(instance: ConfigInstance) {
        instance._client?.emit('messageCreate', { content: 'null' } as any);
    }
}
