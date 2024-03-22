import getFiles from "./getAllFiles";
import { Collection } from "discord.js";
import { Command } from "../typings";
export default (path: string) => {
    const localCommands = new Collection<string, Command>()
    const commandCategories = getFiles(path, true) as string[];
    for (const commandCategory of commandCategories) {
        const commandFiles = getFiles(commandCategory) as string[];
        commandFiles.map((path) => {
            const commandModule: Command = require(path).default;
            if (!commandModule || !commandModule.name) return;
            localCommands.set(commandModule.name.toLowerCase(), commandModule)
        })
    }
    return localCommands;
};
