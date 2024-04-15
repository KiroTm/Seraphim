import { CooldownManager, CooldownConfigOptions } from "./handlers/Cooldowns";
import { FeaturesHandler } from "./handlers/FeaturesHandler";
import { CommandHandler } from "./handlers/CommandHandler";
import { PrefixHandler } from "./handlers/PrefixHandler";
import { CacheLoader } from "./handlers/CacheLoader";
import { Client, Collection } from "discord.js";
import { Stopwatch } from "./utils/StopWatch";
import { Command } from "./typings";
import mongoose from "mongoose";
import figlet from "figlet";

/**
 * Represents the configuration interface for the bot.
 */
export interface ConfigHandlerInterface {
  /** 
   * Chalk library for colorizing terminal output. 
   */
  chalk?: any | undefined;
  /** 
   * Figlet library for generating ASCII art from text. 
   */
  figlet?: any | undefined;
  /** 
   * The Discord client instance. 
   */
  client: Client;
  /** 
   * MongoDB URI for database connection. 
   */
  mongoUri: string;
  /** 
   * Directory path for bot commands. 
   */
  commandsDir?: string | undefined;
  /** 
   * Directory path for bot features. 
   */
  featuresDir?: string | undefined;
  /** 
   * Cache loader options for caching Discord data. 
   */
  cacheOptions?: CacheLoaderOptions[] | undefined;
  /** 
   * Configuration for bot developers. 
   */
  DeveloperConfiguration: {
    /** 
     * Array of bot owners' Discord user IDs. 
     */
    botOwners: string[];
    /** 
     * Array of test server IDs for development purposes. 
     */
    testServers?: string[];
  },
  /** 
   * Configuration for slash commands. 
   */
  SlashCommandConfiguration: {
    /** 
     * Whether to synchronize slash commands with Discord API. 
     */
    SyncSlashCommands: boolean;
  }
  /** 
   * Configuration for legacy commands. 
   */
  LegacyCommandConfiguration: {
    /** 
     * Configuration for command prefixes. 
     */
    PrefixConfiguration?: {
      /** 
       * Default prefix for command invocation. 
       */
      defaultPrefix: string;
      /** 
       * Whether to allow dynamic prefixes. 
       */
      dynamicPrefix: boolean;
    }
    /** 
     * Configuration for command cooldowns. 
     */
    CooldownConfiguration?: CooldownConfigOptions | undefined;
  }
}

/**
 * Represents the main configuration handler for the bot.
 */
export class ConfigHandler {
  /** 
   * The Discord client instance. 
   */
  public _client!: Client;
  /** 
   * Chalk library for colorizing terminal output. 
   */
  public _chalk: any;
  /** 
   * Array of test server IDs for development purposes. 
   */
  public _testServers?: string[];
  /** 
   * Array of bot owners' Discord user IDs. 
   */
  public _botOwners?: string[];
  /** 
   * Cooldown manager for handling command cooldowns. 
   */
  public _cooldownsManager?: CooldownManager;
  /** 
   * Command handler for managing bot commands. 
   */
  public _commandHandler?: CommandHandler;
  /** 
   * Features handler for managing bot features. 
   */
  public _featuresHandler?: FeaturesHandler;
  /** 
   * Indicates whether the bot is connected to the MongoDB database. 
   */
  public _isConnectedToDB: boolean = false;
  /** 
   * Function for reloading commands. 
   */
  public _ReloadCommands!: Function;
  /** 
   * Cache loader options for caching Discord data. 
   */
  public _cacheOptions!: CacheLoaderOptions[];
  /** 
   * Collection of local bot commands. 
   */
  public _localCommands!: Collection<string, Command>
  /** 
   * Prefix handler for managing command prefixes. 
   */
  public _prefixHandler: PrefixHandler | undefined;
  /** 
   * Figlet library for generating ASCII art from text. 
   */
  public _figlet: typeof figlet

  /**
   * Constructs a new instance of the ConfigHandler class.
   * @param {ConfigHandlerInterface} options - The configuration options for the bot.
   */
  constructor(options: ConfigHandlerInterface) {
    this._figlet = options.figlet || require('figlet');

    this._client = options.client;

    this._chalk = options.chalk || require('chalk');


    this.init(options);
  }

  /**
   * Initializes the bot configuration.
   * @param {ConfigHandlerInterface} options - The configuration options for the bot.
   */
  private async init(options: ConfigHandlerInterface) {

    const stopWatch = new Stopwatch()

    stopWatch.start()

    const { client, mongoUri, commandsDir, featuresDir, DeveloperConfiguration, SlashCommandConfiguration, cacheOptions, LegacyCommandConfiguration } = options;

    const { botOwners = [], testServers = [] } = DeveloperConfiguration;

    const { SyncSlashCommands } = SlashCommandConfiguration;

    const { PrefixConfiguration, CooldownConfiguration } = LegacyCommandConfiguration;

    this._testServers = testServers;

    this._botOwners = botOwners;

    console.log(await this._figlet.text(client?.user?.username! ?? "Handler", 'Bloody', ((error) => { })))

    const allFieldsNotPresent = this.checkFields(options)

    console.log(this._chalk.bold.grey(`Configuration Data status:`), !allFieldsNotPresent.result ? this._chalk.green.bold("All Good") : this._chalk.red.bold(`Missing Fields! ${allFieldsNotPresent.fields}`));

    if (allFieldsNotPresent.result) {
      console.log(this._chalk.red("EXITING...."))
      return process.exit(1)
    }

    await this.connectToMongo(mongoUri);

    console.log(this._chalk.bold.grey(`Mongo Database status:`), this._isConnectedToDB ? this._chalk.green.bold("Connected") : this._chalk.red.bold("Disconnected"));

    if (botOwners.length === 0) {
      await client.application?.fetch();
      const ownerId = client.application?.owner?.id;
      if (ownerId && !botOwners.includes(ownerId)) botOwners.push(ownerId);
    }

    console.log(this._chalk.bold.grey("Cooldown Handler:"), LegacyCommandConfiguration.CooldownConfiguration ? this._chalk.green.bold("Active") : this._chalk.red.bold("Disabled"));
    if (LegacyCommandConfiguration.CooldownConfiguration) {
      this._cooldownsManager = CooldownManager.getInstance(this, CooldownConfiguration || { SendWarningMessage: true, CustomErrorMessage: "A little too quick there!", OwnersBypass: false, RatelimitIgnore: true });
    }

    console.log(this._chalk.bold.grey("Prefix Handler:"), PrefixConfiguration ? this._chalk.green.bold("Active") : this._chalk.red.bold("Disabled"));
    if (PrefixConfiguration) {
      this._prefixHandler = PrefixHandler.getInstance(this);
      this._prefixHandler.setDefaultPrefix(PrefixConfiguration.defaultPrefix);
    }


    console.log(this._chalk.bold.grey("Cache Handler:"), (cacheOptions && cacheOptions.length > 0) ? this._chalk.green.bold("Active") : this._chalk.red.bold("Disabled"));
    if (cacheOptions && cacheOptions.length > 0) {
      this._cacheOptions = cacheOptions!;
      CacheLoader.getInstance(this, cacheOptions);
    }

    if (featuresDir) {
      this._featuresHandler = new FeaturesHandler();
      await this._featuresHandler.readFiles(this, featuresDir, client)
      console.log(this._chalk.bold.grey("Total events loaded:"), this._featuresHandler.getLocalFiles().size)
    }

    if (commandsDir) {
      this._commandHandler = new CommandHandler();
      await this._commandHandler.readFiles(this, commandsDir, SyncSlashCommands);
      console.log(this._chalk.bold.grey("Total commands loaded:"), this._commandHandler.getLocalCommands().size)

    }

    const ElapsedTime = stopWatch.stop();

    console.log(this._chalk.yellowBright.bold(`\nClient took ${stopWatch.formatTime(ElapsedTime)} to get ready.`));
  }

  /**
   * Connects to the MongoDB database.
   * @param {string} URI - The MongoDB URI for connection.
   */
  private async connectToMongo(URI: string) {
    await mongoose.connect(URI)
      .catch(() => {
        this._isConnectedToDB = false
      })
      .then(() => {
        this._isConnectedToDB = true
      })
  }

  /**
   * Checks if all required fields are present in the configuration.
   * @param {ConfigHandlerInterface} options - The configuration options for the bot.
   * @returns {object} - An object containing the result and missing fields.
   */
  private checkFields(options: ConfigHandlerInterface) {
    const expectedRequiredFields: string[] = [
      'client',
      'mongoUri',
      'DeveloperConfiguration',
      'LegacyCommandConfiguration',
      'SlashCommandConfiguration'
    ];

    const providedFields: string[] = Object.keys(options)
      .filter(key => !(options[key as keyof ConfigHandlerInterface] instanceof Function));

    const missingFields: string[] = expectedRequiredFields.filter(field => !providedFields.includes(field));

    return {
      result: missingFields.length > 0,
      fields: missingFields ?? undefined

    }
  }

}

/**
 * Represents the configuration instance for the bot.
 */
export interface ConfigInstance {
  /** 
   * Instance of the Chalk library for colorizing terminal output. 
   */
  _chalk: any;
  /** 
   * Instance of the Figlet library for generating ASCII art from text. 
   */
  _figlet: any;
  /** 
   * The Discord client instance. 
   */
  _client: Client;
  /** 
   * Array of test server IDs for development purposes. 
   */
  _testServers?: string[];
  /** 
   * Array of bot owners' Discord user IDs. 
   */
  _botOwners?: string[];
  /** 
   * Instance of the CooldownManager class for handling command cooldowns. 
   */
  _cooldownsManager?: CooldownManager;
  /** 
   * Instance of the CommandHandler class for managing bot commands. 
   */
  _commandHandler?: CommandHandler;
  /** 
   * Instance of the FeaturesHandler class for managing bot features. 
   */
  _featuresHandler?: FeaturesHandler;
  /** 
   * Indicates whether the bot is connected to the MongoDB database. 
   */
  _isConnectedToDB: boolean;
  /** 
   * Function for reloading commands. 
   */
  _ReloadCommands: Function;
  /** 
   * Array of cache loader options for caching Discord data. 
   */
  _cacheOptions?: CacheLoaderOptions[];
  /** 
   * Collection of local bot commands. 
   */
  _localCommands?: Collection<string, Command>;
  /** 
   * Instance of the PrefixHandler class for managing command prefixes. 
   */
  _prefixHandler?: PrefixHandler;
}

/**
 * Enum representing options for cache loading.
 */
export enum CacheLoaderOptions {
  /** 
   * Option to cache members. 
   */
  Members = 'members',
  /** 
   * Option to cache roles. 
   */
  Roles = 'roles',
  /** 
   * Option to cache channels. 
   */
  Channels = 'channels',
  /** 
   * Option to cache bans. 
   */
  Bans = 'bans',
}

/**
 * Enum representing different types of command.
 */
export enum CommandType {
  /** 
   * Slash command type. 
   */
  slash,
  /** 
   * Legacy command type. 
   */
  legacy,
  /** 
   * Represents both slash and legacy commands. 
   */
  both
}