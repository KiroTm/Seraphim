import { Guild, Message, Role } from "discord.js";

export class RoleClass {
    public fetch(guild: Guild, query: string, message?: Message) {
        return message?.mentions.roles?.first() 
        || guild.roles.cache.get(query) 
        || guild.roles.cache.find((role) => role.name.toLowerCase() == query.toLowerCase()) 
        || guild.roles.cache.find((role) => role.name.toLowerCase().includes(query.toLowerCase())) 
        || undefined
    }

    public flags(role: Role) {
        return Object.keys(role.tags || { None: "None" }).join(", ").replace("botId", "Discord Bot Role").replace("guildConnections", "Server Linked Role").replace("availableForPurchase", "Server Purchasable Role").replace("integrationId", "Channel Integration Role").replace("premiumSubscriberRole", "Booster Role")
    }
}