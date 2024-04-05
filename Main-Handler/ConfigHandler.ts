import { Client, Collection } from "discord.js";
import mongoose from "mongoose";
import { CommandHandler } from "./handlers/CommandHandler";
import { FeaturesHandler } from "./handlers/FeaturesHandler";
import { CacheLoader } from "./handlers/CacheLoader";
import { CooldownManager, CooldownConfigOptions } from "./handlers/Cooldowns";
import { Command } from "./typings";
import { PrefixHandler } from "./handlers/PrefixHandler";
import { Logger } from "./classes/Logger";
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
        PrefixConfiguration?: {
            defaultPrefix: string;
            dynamicPrefix: boolean;
        }
        CooldownConfiguration?: CooldownConfigOptions;
    }
}

export class ConfigHandler {
    public _client!: Client;
    public _chalk: any;
    public _stopwatch: Stopwatch;
    public _testServers?: string[];
    public _botOwners?: string[];
    public _cooldownsManager?: CooldownManager;
    public _commandHandler?: CommandHandler;
    public _featuresHandler?: FeaturesHandler;
    public _isConnectedToDB: boolean = false;
    public _ReloadCommands!: Function;
    public _cacheOptions!: CacheLoaderOptions[];
    public _localCommands!: Collection<string, Command>
    public _prefixHandler: PrefixHandler | undefined;
    public _figlet: any | undefined;

    constructor(options: ConfigHandlerInterface) {
        this._figlet = options.figlet || require('figlet');

        this._client = options.client;

        this._stopwatch = new Stopwatch();

        this._stopwatch.start()


        this._chalk = options.chalk || require('chalk');

        console.log(this._chalk.bold.whiteBright("Firing the handler.."))

        this.init(options);
    }

    private async init(options: ConfigHandlerInterface) {
        
        this._stopwatch.start();

        const { client, mongoUri, commandsDir, featuresDir, DeveloperConfiguration, SlashCommandConfiguration, cacheOptions, LegacyCommandConfiguration } = options;

        const { botOwners = [], testServers = [] } = DeveloperConfiguration;

        const { SyncSlashCommands } = SlashCommandConfiguration;

        const { PrefixConfiguration, CooldownConfiguration } = LegacyCommandConfiguration;

        this._testServers = testServers;
        
        this._botOwners = botOwners;

        await this.connectToMongo(mongoUri);

        if (botOwners.length === 0) {
            await client.application?.fetch();
            const ownerId = client.application?.owner?.id;
            if (ownerId && !botOwners.includes(ownerId)) botOwners.push(ownerId);
        }

        this._cooldownsManager = CooldownManager.getInstance(this, CooldownConfiguration || { SendWarningMessage: true, CustomErrorMessage: "A little too quick there!", OwnersBypass: false, RatelimitIgnore: true });

        const i = Date.now()

        if (featuresDir) {
            this._featuresHandler = new FeaturesHandler();
            await this._featuresHandler.readFiles(this, featuresDir, client)
        }

        console.log(Date.now() - i)


        const thi = Date.now()

        if (commandsDir) {
            this._commandHandler = new CommandHandler();
            await this._commandHandler.readFiles(this, commandsDir, SyncSlashCommands);
        }

        console.log(Date.now() - thi)


        if (cacheOptions && cacheOptions.length > 0) {
            this._cacheOptions = cacheOptions;
            CacheLoader.getInstance(this, cacheOptions);
        }

        if (PrefixConfiguration) {
            this._prefixHandler = PrefixHandler.getInstance(this);
            this._prefixHandler.setDefaultPrefix(PrefixConfiguration.defaultPrefix);
        }

        await Logger.startUp(this);

        const ElapsedTime = this._stopwatch.stop();
        console.log(this._chalk.yellowBright.bold.underline(`Client took ${this._stopwatch.formatTime(ElapsedTime)} to get ready.`));
    }

    private async connectToMongo(URI: string) {
        try {
            await mongoose.connect(URI);
            this._isConnectedToDB = true;
        } catch (err) {
            console.error("Failed to connect to MongoDB:", err);
            this._isConnectedToDB = false;
        }
    }
}

export interface ConfigInstance {
    _chalk: any;
    _stopwatch: Stopwatch;
    _figlet: any;
    _client: Client;
    _testServers?: string[];
    _botOwners?: string[];
    _cooldownsManager?: CooldownManager;
    _commandHandler?: CommandHandler;
    _featuresHandler?: FeaturesHandler;
    _isConnectedToDB: boolean;
    _ReloadCommands: Function;
    _cacheOptions?: CacheLoaderOptions[];
    _localCommands?: Collection<string, Command>;
    _prefixHandler?: PrefixHandler;
}

export enum CacheLoaderOptions {
    Members = 'members',
    Roles = 'roles',
    Channels = 'channels',
    Bans = 'bans',
}

export enum CommandType {
    slash,
    legacy,
    both
}