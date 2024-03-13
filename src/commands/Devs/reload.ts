import { CommandType } from "../../../Main-Handler/ConfigHandler";
import { Callback, Command } from "../../../typings";

export default {
    name: "reload",
    description: "Reload Module(s)",
    type: CommandType.legacy,
    ownersOnly: true,
    callback: async ({ message, instance}: Callback) => {               
        if (message) {            
            try {
                instance._ReloadCommands(instance, message.client)                
                await message.channel.send("Reloaded All Slash Commands!")
            } catch (err) {

            }
        }
    }
} as Command