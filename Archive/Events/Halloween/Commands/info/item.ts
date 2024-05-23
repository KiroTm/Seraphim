import { ItemClass } from "../../Classes/item";
import { Callback, Command } from "../../../../../OldHandler/typings";
export default {
    name: "item",
    description: "Get information about an item!",
    cooldown: {
        Duration: '10s'
    },
    callback: async ({message, args}: Callback) => {
        new ItemClass().generate(message, args[0])
    }
} as Command