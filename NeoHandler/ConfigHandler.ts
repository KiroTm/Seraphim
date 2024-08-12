import { CooldownManager, CooldownConfigOptions } from "./classes/Cooldowns";
import { FeaturesHandler } from "./classes/FeaturesHandler";
import { CommandHandler } from "./classes/CommandHandler";
import { PrefixHandler } from "./classes/PrefixHandler";
import { CacheLoader } from "./classes/CacheLoader";
import { Client, Collection } from "discord.js";
import { Stopwatch } from "./utils/StopWatch";
import { Command } from "./typings";
import mongoose from "mongoose";
import figlet from "figlet";

/**
 * Enum representing options for cache loading.
 */
export enum CacheLoaderOptions {
  /** Option to cache members. */
  Members = 'members',
  /** Option to cache roles. */
  Roles = 'roles',
  /** Option to cache channels. */
  Channels = 'channels',
  /** Option to cache bans. */
  Bans = 'bans',
}

/**
 * Enum representing different types of commands.
 */
export enum CommandType {
  /** Slash command type. */
  slash,
  /** Legacy command type. */
  legacy,
  /** Represents both slash and legacy commands. */
  both
}

/**
 * Represents the configuration interface for the bot.
 */
export interface ConfigHandlerInterface {
  /** The Discord client instance. */
  client: Client;
  /** MongoDB URI for database connection. */
  mongoUri: string;
  /** Directory path for bot commands. */
  commandsDir?: string | undefined;
  /** Directory path for bot features. */
  featuresDir?: string | undefined;
  /** Cache loader options for caching Discord data. */
  cacheOptions?: CacheLoaderOptions[] | undefined;
  /** Configuration for bot developers. */
  DeveloperConfiguration: {
    /** Array of bot owners' Discord user IDs. */
    botOwners: string[];
    /** Array of test server IDs for development purposes. */
    testServers?: string[];
  },
  /** Configuration for slash commands. */
  SlashCommandConfiguration: {
    /** Whether to synchronize slash commands with Discord API. */
    SyncSlashCommands: boolean;
  }
  /** Configuration for legacy commands. */
  LegacyCommandConfiguration: {
    /** Configuration for command prefixes. */
    PrefixConfiguration?: {
      /** Default prefix for command invocation. */
      defaultPrefix: string;
      /** Whether to allow dynamic prefixes. */
      dynamicPrefix: boolean;
      /** Whether to allow mention prefixes */
      mentionPrefix: boolean;
    }
    /** Configuration for command cooldowns. */
    CooldownConfiguration?: CooldownConfigOptions | undefined;
  }
}

/**
 * Represents the main configuration handler for the bot.
 */
export class ConfigHandler {
  /** The Discord client instance. */
  public _client!: Client;
  /** Chalk library for colorizing terminal output. */
  public _chalk: any;
  /** Array of test server IDs for development purposes. */
  public _testServers?: string[];
  /** Array of bot owners' Discord user IDs. */
  public _botOwners?: string[];
  /** Cooldown manager for handling command cooldowns. */
  public _cooldownsManager?: CooldownManager;
  /** Command handler for managing bot commands. */
  public _commandHandler?: CommandHandler;
  /** Features handler for managing bot features. */
  public _featuresHandler?: FeaturesHandler;
  /** Indicates whether the bot is connected to the MongoDB database. */
  public _isConnectedToDB: boolean = false;
  /** Function for reloading commands. */
  public _ReloadCommands!: Function;
  /** Cache loader options for caching Discord data. */
  public _cacheOptions!: CacheLoaderOptions[];
  /** Collection of local bot commands. */
  public _localCommands!: Collection<string, Command>
  /** Prefix handler for managing command prefixes. */
  public _prefixHandler: PrefixHandler | undefined;
  /** Figlet library for generating ASCII art from text. */
  public _figlet: typeof figlet

  /**
   * Constructs a new instance of the ConfigHandler class.
   * @param {ConfigHandlerInterface} options - The configuration options for the bot.
   */
  constructor(options: ConfigHandlerInterface) {
    this._client = options.client;
    this._figlet = require('figlet');
    this.init(options);
  }

  /**
   * Initializes the bot configuration.
   * @param {ConfigHandlerInterface} options - The configuration options for the bot.
   */
  private async init(options: ConfigHandlerInterface) {
    this._chalk = (await import('chalk')).default;
    const stopWatch = new Stopwatch();
    stopWatch.start();

    const { client, mongoUri, commandsDir, featuresDir, DeveloperConfiguration, SlashCommandConfiguration, cacheOptions, LegacyCommandConfiguration } = options;

    this._testServers = DeveloperConfiguration.testServers;
    this._botOwners = DeveloperConfiguration.botOwners;

    console.log(await this._figlet.text(client?.user?.username! ?? "Handler", 'Bloody', (error) => {}));

    const allFieldsNotPresent = this.checkFields(options);

    console.log(this._chalk.bold.grey(`Configuration Data status:`), !allFieldsNotPresent.result ? this._chalk.green.bold("All Good") : this._chalk.red.bold(`Missing Fields! ${allFieldsNotPresent.fields}`));

    if (allFieldsNotPresent.result) {
      console.log(this._chalk.red("EXITING...."));
      return process.exit(1);
    }

    await this.connectToMongo(mongoUri);

    console.log(this._chalk.bold.grey(`Mongo Database status:`), this._isConnectedToDB ? this._chalk.green.bold("Connected") : this._chalk.red.bold("Disconnected"));

    await this.initializeBotOwners(client, DeveloperConfiguration);

    if (LegacyCommandConfiguration.CooldownConfiguration) {
      this.initializeCooldownHandler(LegacyCommandConfiguration.CooldownConfiguration);
    }

    if (LegacyCommandConfiguration.PrefixConfiguration) {
      this.initializePrefixHandler(LegacyCommandConfiguration.PrefixConfiguration);
    }

    if (cacheOptions && cacheOptions.length > 0) {
      this.initializeCacheHandler(cacheOptions);
    }

    if (featuresDir) {
      await this.initializeFeaturesHandler(featuresDir, client);
    }

    if (commandsDir) {
      await this.initializeCommandHandler(commandsDir, SlashCommandConfiguration.SyncSlashCommands);
    }

    const ElapsedTime = stopWatch.stop();
    console.log(this._chalk.yellowBright.bold(`\nClient took ${stopWatch.formatTime(ElapsedTime)} to get ready.`));
  }

  /**
   * Connects to the MongoDB database.
   * @param {string} URI - The MongoDB URI for connection.
   */
  private async connectToMongo(URI: string) {
    try {
      await mongoose.connect(URI);
      this._isConnectedToDB = true;
    } catch (error) {
      console.log(error)
      this._isConnectedToDB = false;
    }
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
    };
  }

  /**
   * Initializes the bot owners.
   * @param {Client} client - The Discord client instance.
   * @param {object} DeveloperConfiguration - The developer configuration options.
   */
  private async initializeBotOwners(client: Client, DeveloperConfiguration: { botOwners: string[], testServers?: string[] }) {
    if (DeveloperConfiguration.botOwners.length === 0) {
      await client.application?.fetch();
      const ownerId = client.application?.owner?.id;
      if (ownerId && !DeveloperConfiguration.botOwners.includes(ownerId)) {
        DeveloperConfiguration.botOwners.push(ownerId);
      }
    }
  }

  /**
   * Initializes the cooldown handler.
   * @param {CooldownConfigOptions} CooldownConfiguration - The cooldown configuration options.
   */
  private initializeCooldownHandler(CooldownConfiguration: CooldownConfigOptions) {
    this._cooldownsManager = CooldownManager.getInstance(this, CooldownConfiguration);
  }

  /**
   * Initializes the prefix handler.
   * @param {object} PrefixConfiguration - The prefix configuration options.
   */
  private initializePrefixHandler(PrefixConfiguration: { defaultPrefix: string, dynamicPrefix: boolean, mentionPrefix: boolean }) {
    this._prefixHandler = PrefixHandler.getInstance(this);
    this._prefixHandler.setDefaultPrefix(PrefixConfiguration.defaultPrefix);
  }

  /**
   * Initializes the cache handler.
   * @param {CacheLoaderOptions[]} cacheOptions - The cache options for caching Discord data.
   */
  private initializeCacheHandler(cacheOptions: CacheLoaderOptions[]) {
    this._cacheOptions = cacheOptions;
    CacheLoader.getInstance(this, cacheOptions);
  }

  /**
   * Initializes the features handler.
   * @param {string} featuresDir - The directory path for bot features.
   * @param {Client} client - The Discord client instance.
   */
  private async initializeFeaturesHandler(featuresDir: string, client: Client) {
    this._featuresHandler = new FeaturesHandler();
    await this._featuresHandler.readFiles(this, featuresDir, client);
    console.log(this._chalk.bold.grey("Total events loaded:"), this._featuresHandler.getLocalFiles().size);
  }

  /**
   * Initializes the command handler.
   * @param {string} commandsDir - The directory path for bot commands.
   * @param {boolean} SyncSlashCommands - Whether to synchronize slash commands with Discord API.
   */
  private async initializeCommandHandler(commandsDir: string, SyncSlashCommands: boolean) {
    this._commandHandler = new CommandHandler();
    await this._commandHandler.readFiles(this, commandsDir, SyncSlashCommands);
    console.log(this._chalk.bold.grey("Total commands loaded:"), this._commandHandler.getLocalCommands().size);
  }
}

/**
 * Represents the configuration instance for the bot.
 */
export interface ConfigInstance {
  /** Instance of the Chalk library for colorizing terminal output. */
  _chalk: any;
  /** Instance of the Figlet library for generating ASCII art from text. */
  _figlet: any;
  /** The Discord client instance. */
  _client: Client;
  /** Array of test server IDs for development purposes. */
  _testServers?: string[];
  /** Array of bot owners' Discord user IDs. */
  _botOwners?: string[];
  /** Instance of the CooldownManager class for handling command cooldowns. */
  _cooldownsManager?: CooldownManager;
  /** Instance of the CommandHandler class for managing bot commands. */
  _commandHandler?: CommandHandler;
  /** Instance of the FeaturesHandler class for managing bot features. */
  _featuresHandler?: FeaturesHandler;
  /** Indicates whether the bot is connected to the MongoDB database. */
  _isConnectedToDB: boolean;
  /** Function for reloading commands. */
  _ReloadCommands: Function;
  /** Array of cache loader options for caching Discord data. */
  _cacheOptions?: CacheLoaderOptions[];
  /** Collection of local bot commands. */
  _localCommands?: Collection<string, Command>;
  /** Instance of the PrefixHandler class for managing command prefixes. */
  _prefixHandler?: PrefixHandler;
}
