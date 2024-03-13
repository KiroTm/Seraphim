import { Channel, ChannelType, Guild, Message, TextChannel } from "discord.js";

export class ChannelClass {
    public fetchChannel(guild: Guild, query: string, message?: Message | undefined): Channel | undefined {
        return message?.mentions?.channels?.first() 
        || guild.channels.cache.get(query) 
        || guild.channels.cache.find((member) => member.name.toLowerCase() == query.toLowerCase()) 
        || guild.channels.cache.find((member) => member.name.toLowerCase().includes(query.toLowerCase())) 
        || undefined
    }

    public setSlowmode(channel: TextChannel, time: number) {
        channel.setRateLimitPerUser(time)
    }
}