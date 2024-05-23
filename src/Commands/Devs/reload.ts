import { CommandType } from "../../../OldHandler/ConfigHandler";
import { Callback, Command } from "../../../OldHandler/typings";

export default {
    name: "reload",
    description: "Reload Module(s)",
    type: CommandType.legacy,
    ownersOnly: true,
    callback: async ({ message, instance }: Callback) => {
        instance._ReloadCommands(instance, message.client, true)
        await message.channel.send("Reloaded All Slash Commands!")
    }
} as Command