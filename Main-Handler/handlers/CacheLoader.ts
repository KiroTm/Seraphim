import { Client, Guild } from "discord.js";
import { ConfigInstance, CacheLoaderOptions } from "../ConfigHandler";

export class CacheLoader {
    private static instance: CacheLoader | null = null;
    private timer: NodeJS.Timeout | null = null;

    private constructor(instance: ConfigInstance, cacheLoaderOpts: CacheLoaderOptions[] | undefined) {
        this.emit(instance);
        this.bulk_loadcache(instance, cacheLoaderOpts);
        this.timer = setInterval(() => this.bulk_loadcache(instance, cacheLoaderOpts), 30 * 1000);
    }

    public static getInstance(instance: ConfigInstance, cacheLoaderOpts: CacheLoaderOptions[] | undefined): CacheLoader {
        console.log(instance._chalk.bold.white(`➙ Started Caching for: ${instance._cacheOptions.join(', ')}`));
        return this.instance || (this.instance = new CacheLoader(instance, cacheLoaderOpts));
    }

    private async bulk_loadcache(instance: ConfigInstance, cacheLoaderOpts: CacheLoaderOptions[] | undefined) {
        const client = instance._client as Client;
        client.guilds.cache.forEach(async (guild: Guild) => {
            if (cacheLoaderOpts?.includes(CacheLoaderOptions.Members)) {
                if (guild.members.cache?.size > 30) return;
                await guild.members.fetch();
            }

            if (cacheLoaderOpts?.includes(CacheLoaderOptions.Roles)) {
                if (guild.members.cache?.size > 30) return;
                await guild.roles.fetch();
            }

            if (cacheLoaderOpts?.includes(CacheLoaderOptions.Channels)) {
                if (guild.channels.cache?.size > 4) return;
                await guild.channels.fetch();
            }

            if (cacheLoaderOpts?.includes(CacheLoaderOptions.Bans)) {
                await guild.bans.fetch();
            }
        });
    }

    private emit(instance: ConfigInstance) {
        console.log(instance._chalk.bold.white(`➙ Emitting 'messageCreate' to remove command response delay!\n`));
        instance._client?.emit('messageCreate', { content: 'null' } as any);
    }
}
