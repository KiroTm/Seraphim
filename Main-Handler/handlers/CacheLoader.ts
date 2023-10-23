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
            if (cacheLoaderOpts?.includes(CacheLoaderOptions.Members) && !guild.members.cache.size) {
                await guild.members.fetch();
            }

            if (cacheLoaderOpts?.includes(CacheLoaderOptions.Roles) && !guild.roles.cache.size) {
                await guild.roles.fetch();
            }

            if (cacheLoaderOpts?.includes(CacheLoaderOptions.Channels) && !guild.channels.cache.size) {
                await guild.channels.fetch();
            }

            if (cacheLoaderOpts?.includes(CacheLoaderOptions.Bans) && !guild.bans.cache.size) {
                try {
                    await guild.bans.fetch();
                } catch (er) {}
            }
        });
    }

    private emit(instance: ConfigInstance) {
        console.log(instance._chalk.bold.white(`➙ Emitting 'messageCreate' to remove command response delay!\n`));
        instance._client?.emit('messageCreate', { content: 'null' } as any);
    }
}
