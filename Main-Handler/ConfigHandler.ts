import { CooldownManager, CooldownConfigOptions } from "./handlers/Cooldowns";
import { FeaturesHandler } from "./handlers/FeaturesHandler";
import { CommandHandler } from "./handlers/CommandHandler";
import { PrefixHandler } from "./handlers/PrefixHandler";
import { CacheLoader } from "./handlers/CacheLoader";
import { Client, Collection } from "discord.js";
import { Stopwatch } from "./classes/StopWatch";
import { Command } from "./typings";
import mongoose from "mongoose";
import figlet from "figlet";

export interface ConfigHandlerInterface {
  chalk?: any | undefined;
  figlet?: any | undefined;
  client: Client;
  mongoUri: string;
  commandsDir?: string | undefined;
  featuresDir?: string | undefined;
  cacheOptions?: CacheLoaderOptions[] | undefined;
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
    CooldownConfiguration?: CooldownConfigOptions | undefined;
  }
}

export class ConfigHandler {
  public _client!: Client;
  public _chalk: any;
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
  public _figlet: typeof figlet

  constructor(options: ConfigHandlerInterface) {
    this._figlet = options.figlet || require('figlet');

    this._client = options.client;

    this._chalk = options.chalk || require('chalk');


    this.init(options);
  }

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

  private async connectToMongo(URI: string) {
      await mongoose.connect(URI)
      .catch(() => {
        this._isConnectedToDB = false
      })
      .then(() => {
        this._isConnectedToDB = true
      })
  }

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

export interface ConfigInstance {
  _chalk: any;
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
