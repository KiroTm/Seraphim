import { Client, Collection } from "discord.js";
import mongoose from "mongoose";
import { CommandHandler } from "./handlers/CommandHandler";
import { FeaturesHandler } from "./handlers/FeaturesHandler";
import { CacheLoader } from "./handlers/CacheLoader";
import { CooldownConfigOptions, CooldownManager } from "./handlers/Cooldowns";
import { Command } from "../typings";
import { PrefixHandler } from "./handlers/PrefixHandler";

export class ConfigHandler {
    public _client: Client | undefined;
    public _testServers: string[] | undefined;
    public _botOwners: string[] | undefined;
    public _cooldownsManager: CooldownManager | undefined;
    public _commandHandler: CommandHandler | undefined;
    public _eventHandler: any | undefined;
    public _featuresHandler: FeaturesHandler | undefined;
    public _isConnectedToDB: boolean | false | undefined;
    public _chalk: any;
    public _ReloadCommands!: Function;
    public _cacheOptions!: CacheLoaderOptions[];
    public _localCommands!: Collection<string, Command>
    public _isConnectedToDb!: boolean
    public _prefixHandler: PrefixHandler | undefined;

    constructor(options: {
        client: Client;
        mongoUri: string;
        commandsDir?: string;
        featuresDir?: string;
        testServers?: string[];
        botOwners: string[];
        SyncSlashCommands?: boolean;
        cacheOptions?: CacheLoaderOptions[];
        CooldownConfiguration?: CooldownConfigOptions;
    }) {
        this.init(options);
    }

    async init(options: {
        client: Client;
        mongoUri: string;
        commandsDir?: string;
        featuresDir?: string;
        testServers?: string[];
        botOwners: string[];
        SyncSlashCommands?: boolean;
        cacheOptions?: CacheLoaderOptions[];
        CooldownConfiguration?: CooldownConfigOptions;
    }) {
        const commandHandler = new CommandHandler();
        const chalk = (await import('chalk')).default;
        console.log(chalk.magentaBright.bold.underline.italic("Reading Config Data..."));
        const { client, mongoUri, commandsDir, featuresDir, testServers, botOwners, SyncSlashCommands, cacheOptions, CooldownConfiguration } = options;
        console.log(`${chalk.bold.white("➙ Connecting to mongoose..")}`);
        await this.connectToMongo(mongoUri, chalk);
        if (botOwners.length === 0) {
            await client.application?.fetch();
            const ownerId = client.application?.owner?.id;
            if (ownerId && !botOwners.includes(ownerId)) botOwners.push(ownerId);
        }
        this._chalk = chalk
        this._client = client;
        this._testServers = testServers;
        this._botOwners = botOwners;
        this._ReloadCommands = async (instance_1: ConfigInstance) => this._commandHandler?.readFiles(instance_1, commandsDir!)
        this._cooldownsManager = CooldownManager.getInstance(this, CooldownConfiguration ?? { SendWarningMessage: true, CustomErrorMessage: "A little too quick there!", OwnersBypass: false, RatelimitIgnore: true });
        if (featuresDir) this._featuresHandler = new FeaturesHandler(this, featuresDir, client, chalk);
        if (commandsDir) this._commandHandler = commandHandler;
        if (commandsDir && SyncSlashCommands === true) commandHandler.readFiles(this, commandsDir);
        if (cacheOptions && cacheOptions.length > 0) {
            this._cacheOptions = cacheOptions;
            CacheLoader.getInstance(this, cacheOptions);
        }
        this._prefixHandler = PrefixHandler.getInstance(this)
    }

    get client() { return this._client; }
    get testServers() { return this._testServers; }
    get botOwners() { return this._botOwners; }
    get cooldowns() { return this._cooldownsManager; }
    get commandHandler() { return this._commandHandler; }
    get eventHandler() { return this._eventHandler; }

    private async connectToMongo(URI: string, chalk: any) {
        await mongoose.connect(URI).then(async () => {
            this._isConnectedToDB = true;
            console.log(`${chalk.bold.white("   ↳ Mongoose connected!\n")}`);
        }).catch((err) => console.log("   ↳ Mongoose failed to connect", err));
    }
}

export interface ConfigInstance {
    _client: Client | undefined;
    _testServers: Array<string> | undefined;
    _botOwners: Array<string> | undefined;
    _cooldownsManager: CooldownManager | undefined;
    _commandHandler: CommandHandler | undefined;
    _eventHandler: any | undefined;
    _featuresHandler: FeaturesHandler | undefined;
    _isConnectedToDB: boolean | false | undefined;
    _chalk: any;
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