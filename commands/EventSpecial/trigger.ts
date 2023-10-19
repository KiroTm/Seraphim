import { DropClass } from "../../classes/EventSpecial/drops";
import { Callback, Command } from "../../typings";
const dropsClass = DropClass.getInstance()
export default {
    name: "trigger",
    description: "trigger drops",
    callback: async ({message}: Callback) => {
        if (!['919568881939517460', '600707283097485322'].includes(message.author.id)) return;
        dropsClass.trigger()
    }
} as Command