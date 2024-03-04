import { DiscordjsError } from "discord.js";
import { ConfigHandler } from "../../Main-Handler/ConfigHandler";

export default async (instance: ConfigHandler, error: DiscordjsError) => {
    console.log(instance._chalk.red(`New Error: ${error}`))
}