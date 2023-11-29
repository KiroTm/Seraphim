import { Message } from "discord.js";
import { ConfigInstance } from "../../Main-Handler/ConfigHandler";
import { AutomodClass } from "../../classes/moderation/automod";
const automodClass = AutomodClass.getInstance()
export default async (instance: ConfigInstance, message: Message) => {
    const bannedWords = automodClass.AutomodCollection.get(message.guildId as string)
    if (!bannedWords) return;
    const words = bannedWords.query
    const args = message.content.split(/\s+/).filter(item => item.trim() !== '');
    
}