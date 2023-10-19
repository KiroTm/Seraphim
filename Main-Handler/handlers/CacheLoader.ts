import { Client, Guild, Message } from "discord.js";
import { ConfigInstance, CacheLoaderOptions } from "../ConfigHandler";
export class CacheLoader {
	private static instance: CacheLoader | null = null;
    private timer: NodeJS.Timeout | null = null;

    private constructor(instance: ConfigInstance, cacheLoaderOpts: CacheLoaderOptions[] | undefined) {
		this.emit(instance)
		this.bulk_loadcache(instance, cacheLoaderOpts)
        this.timer = setInterval(() => this.bulk_loadcache(instance, cacheLoaderOpts), 30 * 1000);
    }

    public static getInstance(instance: ConfigInstance, cacheLoaderOpts: CacheLoaderOptions[] | undefined): CacheLoader {
		console.log(instance._chalk.bold.white(`➙ Started Caching for: ${instance._cacheOptions.join(', ')}`));
        return this.instance || (this.instance = new CacheLoader(instance, cacheLoaderOpts));
    }

	private async bulk_loadcache(instance: ConfigInstance, CacheLoaderOpts: CacheLoaderOptions[] | undefined) {
		const client = instance._client as Client
		client.guilds.cache.forEach(async (guild: Guild) => {
			if (CacheLoaderOpts?.includes(CacheLoaderOptions.Members)) {
				await guild.members.fetch();
			}

			if (CacheLoaderOpts?.includes(CacheLoaderOptions.Roles)) {
				await guild.roles.fetch();
			}

			if (CacheLoaderOpts?.includes(CacheLoaderOptions.Channels)) {
				await guild.channels.fetch();
			}		
			
			if (CacheLoaderOpts?.includes(CacheLoaderOptions.Bans)) {
				try {
					await guild.bans.fetch()
				} catch (er){}
			}
		})
	}

	private emit(instance: ConfigInstance) {
		console.log(instance._chalk.bold.white(`➙ Emitting 'messageCreate' to remove command response delay!\n`))
        const msg = {content: 'null'} as Message
        instance._client?.emit('messageCreate', msg)
	}

}