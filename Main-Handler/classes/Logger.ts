import figlet from "figlet";
import { ConfigInstance } from "../ConfigHandler";
import { Stopwatch } from "./StopWatch";

export class Logger {
    static async startUp(instance: ConfigInstance) {
        const { _commandHandler, _chalk, _isConnectedToDB, _cacheOptions, _featuresHandler  } = instance;
        const TotalCommands = _commandHandler?.getLocalCommands()!;
        const TotalFeatures = _featuresHandler?.getLocalFiles()!;
        console.log(_chalk.bold.grey(`Mongo Database status:`), _isConnectedToDB ? _chalk.greenBright.bold("Connected") : _chalk.redBright.bold("Failed to connect"));
        console.log(_chalk.bold.grey(`Caching status:`), _cacheOptions && _cacheOptions.length > 0 ? _chalk.greenBright.bold("Active") : _chalk.redBright.bold("Disabled"));
        if (_commandHandler) console.log(_chalk.bold.grey(`Total commands loaded:`), TotalCommands.size)
        if (_featuresHandler) console.log(_chalk.bold.grey(`Total events loaded:`), TotalFeatures.size)
    }
}