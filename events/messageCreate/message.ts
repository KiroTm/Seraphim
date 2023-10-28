import { Message } from "discord.js";
import { ConfigInstance } from "../../Main-Handler/ConfigHandler";
import { StatsClass } from "../../classes/misc/Message";
const statsClass = StatsClass.getInstance()
export default (instance: ConfigInstance, message: Message) => {
    if (message.author.bot || !message.channel.isTextBased()) return;
    // statsClass.add(message)
}