import { Message } from "discord.js";
import { ConfigInstance } from "../../Main-Handler/ConfigHandler";
import { AutomodClass } from "../../classes/moderation/automod";
const automodClass = AutomodClass.getInstance()
export default async (instance: ConfigInstance, message: Message) => {
    const bannedWords = automodClass.AutomodCollection.get(message.guildId as string)
    if (!bannedWords) return;
    const words = bannedWords.query as string[]
    const args = message.content.toLowerCase().split(/\s+/).filter(item => item.trim() !== '') as string[]
    if (words.some(word => args.some(arg => arg.includes(word)))) {
        message.channel.send(`${message.author} That word isn't allowed!`).then((msg) => setTimeout(() => {msg.delete()}, 3000))
        message.delete();
    }
}