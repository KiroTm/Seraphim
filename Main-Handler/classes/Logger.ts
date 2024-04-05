import { ConfigInstance } from "../ConfigHandler";

export class Logger {
    static async startUp(instance: ConfigInstance) {
        const { _client: { user, guilds,  }, _commandHandler, _chalk, _isConnectedToDB, _cacheOptions, _figlet: { text }, _featuresHandler  } = instance;
        const BotASCII = await text(user?.username!, 'Bloody', ((err: Error) => {return;}))
        const TotalCommands = _commandHandler?.getLocalCommands()!;
        const TotalFeatures = _featuresHandler?.getLocalFiles()!;
        console.log(BotASCII ?? _chalk.grey(`Logged in as ${user?.username}`))
        console.log(_chalk.grey(`Mongo Database status:`), _isConnectedToDB ? _chalk.greenBright.bold("Connected") : _chalk.redBright.bold("Failed to connect"));
        console.log(_chalk.grey(`Caching status:`), _cacheOptions && _cacheOptions.length > 0 ? _chalk.greenBright.bold("Active") : _chalk.redBright.bold("Disabled"));
        console.log(_chalk.grey(`Total commands loaded:`), TotalCommands.size)
        console.log(_chalk.grey(`Total events loaded:`), TotalFeatures.size)
        console.log(_chalk.grey(`Total event files loaded:`), Array.from(TotalFeatures.entries()).slice(0, 5).reduce((total, [, numOfFiles]) => total + numOfFiles, 0))
    }
}