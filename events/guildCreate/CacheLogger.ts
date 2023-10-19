import { Guild } from "discord.js";
import { ConfigHandler } from "../../Main-Handler/ConfigHandler";
import { CacheLoader } from "../../Main-Handler/handlers/CacheLoader";
export default async (instance: ConfigHandler, guild: Guild) => {
    guild.members.fetch()
    guild.channels.fetch()
    guild.roles.fetch()
}   