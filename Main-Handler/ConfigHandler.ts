import { Client, Collection } from "discord.js";
import mongoose from "mongoose";
import { CommandHandler } from "./handlers/CommandHandler";
import { FeaturesHandler } from "./handlers/FeaturesHandler";
import { CacheLoader } from "./handlers/CacheLoader";
import { CooldownConfigOptions, CooldownManager } from "./handlers/Cooldowns";
import { Command } from "./typings";
import { PrefixHandler } from "./handlers/PrefixHandler";
import { Logger } from "./classes/Logger";
import figlet from "figlet";
import { Stopwatch } from "./classes/StopWatch";

export interface ConfigHandlerInterface {
    chalk?: any;
    figlet?: any;
    client: Client;
    mongoUri: string;
    commandsDir?: string;
    featuresDir?: string;
    cacheOptions?: CacheLoaderOptions[];
    DeveloperConfiguration: {
        botOwners: string[];
        testServers?: string[];
    },
    SlashCommandConfiguration: {
        SyncSlashCommands: boolean;
    }
    LegacyCommandConfiguration: {
        PrefixConfiguration: {
            defaultPrefix: string;
            dynamicPrefix: boolean;
        }
        CooldownConfiguration?: CooldownConfigOptions;
    }
}

export class ConfigHandler {
    public _client!: Client;
    public _chalk: any;
    public _testServers: string[] | undefined;
    public _botOwners: string[] | undefined;
    public _cooldownsManager: CooldownManager | undefined;
    public _commandHandler: CommandHandler | undefined;
    public _eventHandler: any | undefined;
    public _featuresHandler: FeaturesHandler | undefined;
    public _isConnectedToDB: boolean | false | undefined;
    public _ReloadCommands!: Function;
    public _cacheOptions!: CacheLoaderOptions[];
    public _localCommands!: Collection<string, Command>
    public _prefixHandler: PrefixHandler | undefined;
    public _figlet: any | undefined

    constructor(options: ConfigHandlerInterface) {
        this.init(options);
    }

    async init(options: ConfigHandlerInterface) {

        let stopWatch = new Stopwatch()

        stopWatch.start()

        let { client, mongoUri, commandsDir, featuresDir, DeveloperConfiguration , SlashCommandConfiguration, cacheOptions, LegacyCommandConfiguration, chalk, figlet } = options;

        let { PrefixConfiguration, CooldownConfiguration } = LegacyCommandConfiguration

        let { SyncSlashCommands } = SlashCommandConfiguration

        let { botOwners, testServers } = DeveloperConfiguration

        const commandHandler = new CommandHandler();

        chalk = chalk ?? (await import('chalk')).default;

        figlet = figlet ?? (await import('figlet')).default;

        await this.connectToMongo(mongoUri);

        if (botOwners.length === 0) {
            await client.application?.fetch();
            const ownerId = client.application?.owner?.id;
            if (ownerId && !botOwners.includes(ownerId)) botOwners.push(ownerId);
        }

        this._chalk = chalk

        this._figlet = figlet

        this._client = client;

        this._testServers = testServers;

        this._botOwners = botOwners;

        this._ReloadCommands = async (instance_1: ConfigInstance) => this._commandHandler?.readFiles(instance_1, commandsDir!)

        this._cooldownsManager = CooldownManager.getInstance(this, CooldownConfiguration ?? { SendWarningMessage: true, CustomErrorMessage: "A little too quick there!", OwnersBypass: false, RatelimitIgnore: true });

        if (featuresDir) this._featuresHandler = new FeaturesHandler(this, featuresDir, client, chalk);

        if (commandsDir) { this._commandHandler = commandHandler; commandHandler.readFiles(this, commandsDir, SyncSlashCommands) }

        if (cacheOptions && cacheOptions.length > 0) {
            this._cacheOptions = cacheOptions;
            CacheLoader.getInstance(this, cacheOptions) 
        }

        if (LegacyCommandConfiguration.PrefixConfiguration) {
            this._prefixHandler = PrefixHandler.getInstance(this); 
            PrefixHandler.getInstance(this).setDefaultPrefix(PrefixConfiguration.defaultPrefix)
        }

        await Logger.startUp(this)

        const ElapsedTime = stopWatch.stop();

        console.log(chalk.yellowBright.bold.underline(`Client took ${stopWatch.formatTime(ElapsedTime)} to get ready.`))
    }

    private async connectToMongo(URI: string) {
        await mongoose.connect(URI)
        .catch((err) => {
            this._isConnectedToDB = false
        })
        .then(async () => {
            this._isConnectedToDB = true;
        })
    }
}

export interface ConfigInstance {
    _chalk: any;
    _figlet: any;
    _client: Client;
    _testServers: Array<string> | undefined;
    _botOwners: Array<string> | undefined;
    _cooldownsManager: CooldownManager | undefined;
    _commandHandler: CommandHandler | undefined;
    _eventHandler: any | undefined;
    _featuresHandler: FeaturesHandler | undefined;
    _isConnectedToDB: boolean | false | undefined;
    _ReloadCommands: Function;
    _cacheOptions: CacheLoaderOptions[]
    _localCommands: Collection<string, Command>
    _prefixHandler: PrefixHandler | undefined;
}

export enum CommandType {
    slash,
    legacy,
    both
}

export enum CacheLoaderOptions {
    Members = 'members',
    Roles = 'roles',
    Channels = 'channels',
    Bans = 'bans',
}