import { Message, TextChannel } from "discord.js";
import { ConfigInstance } from "../../Main-Handler/ConfigHandler";
import { AutomodClass } from "../../classes/moderation/automod";
const automodClass = AutomodClass.getInstance()
export default async (instance: ConfigInstance, message: Message) => {
    const data = automodClass.AutomodCollection.get(message.guildId as string)
    if (!data) return;
    console.log(data)
    const c = (message.channel as TextChannel)
}