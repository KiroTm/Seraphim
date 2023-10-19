import { Client, Message, User } from "discord.js";

export class UserClass {
    public async fetch(client: Client, query: string, message?: Message | undefined): Promise<User | undefined> {
        return message?.mentions?.users?.first() ||
        client.users.cache.get(query) || 
        client.users.cache.find((u) => u.username.toLowerCase() == query.toLowerCase()) ||
        client.users.cache.find((u) => u.username.toLowerCase().includes(query.toLowerCase())) || 
        client.users.fetch(query, { force: true }).catch(() => undefined) || 
        undefined
    }

}