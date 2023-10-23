import { ItemClass } from "../../../classes/EventSpecial/item";
import { Callback, Command } from "../../../typings";
export default {
    name: "item",
    description: "Get information about an item!",
    callback: async ({message, args}: Callback) => {
        new ItemClass().generate(message, args[0])
    }
} as Command