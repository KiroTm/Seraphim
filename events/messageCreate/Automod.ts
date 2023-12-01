import { Message } from "discord.js";
import { ConfigInstance } from "../../Main-Handler/ConfigHandler";
import { AutomodClass } from "../../classes/moderation/automod";
const automodClass = AutomodClass.getInstance()
export default async (instance: ConfigInstance, message: Message) => {
    if (!automodClass.AutomodCollection) return;
    const data = automodClass.AutomodCollection.get('bannedWords')
    const match = data?.find((d) => d.filterType === 'match')
    if (!match) return;
    if (match.query?.includes(message.content.toLowerCase())) {
        message.channel.send(`${message.author} That word isn't allowed!`)
        await message.delete().catch(() => {})
    }
}