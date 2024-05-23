import { AuditLogEvent, Guild, GuildAuditLogsEntry, GuildAuditLogsFetchOptions } from "discord.js";
import { ConfigHandler } from "../../../OldHandler/ConfigHandler";
export default async (instance: ConfigHandler, guild: Guild) => {
    await guild.members.fetch()
    await guild.channels.fetch()
    await guild.roles.fetch()
}   