import { Client, ClientOptions } from "discord.js";
import { CooldownConfigOptions } from "../../OldHandler/classes/Cooldowns";
import { global } from "../Core/shared/global"

/**
 * Custom client class extending the Discord.js Client, providing advanced configurations and features tailored for robust bot development.
 * @template Ready - Indicates whether the client is ready after logging in.
 * @extends {Client} - {@link [Discord.JS docs](https://discord.js.org/#/docs/main/stable/class/Client)}
 */
export class GarnetClient<Ready extends boolean = boolean> extends Client<Ready> {
    /** Manages cooldowns across commands to limit rate usage. */
    public cooldowns?: any;

    public LoaderRegistry?: any

    /**
     * Constructs a new enhanced client.
     * @param {GarnetClientOptions} options - Custom options for the GarnetClient.
     * @example 
     * ```typescript
     * const client = new GarnetClient({
     *      intents: [
     *          IntentsBitField.Flags.Guilds,
     *          IntentsBitField.Flags.GuildMessages,
     *          IntentsBitField.Flags.MessageContent
     *      ],
     *      prefixConfig: {
     *          defaultPrefix: "?",
     *          dynamicPrefix: true,
     *          mentionPrefix: true
     *      },
     *      CooldownConfiguration: {
     *          SendWarningMessage: true,
     *          CustomErrorMessage: "Please wait {TIME} before trying again.",
     *          OwnersBypass: true,
     *          RatelimitIgnore: true,
     *      },
     *      DeveloperConfiguration: {
     *          botOwners: ["123456789012345678"],
     *      }
     * });
     * ```
     */
    public constructor(options: GarnetClientOptions) {
        super(options);
        global.client = this
    }

    /**
     * Logs the client into the Discord API using a specified token.
     * @param {string} token - The bot token to use for authentication.
     * @returns {Promise<string>} A promise that resolves with the token used for logging in.
     */ 
    public override async login(token: string): Promise<string> {
        return super.login(token);
    }
}

/**
 * Interface for specifying advanced options for the custom GarnetClient.
 * @extends {ClientOptions} - Standard Discord.js client options.
 */
export interface GarnetClientOptions extends ClientOptions {
    /**
     * Configuration for command prefixes.
     */
    prefixConfig?: {
        /**
         * The default prefix for commands.
         * @default "!"
         */
        defaultPrefix: string;
        /**
         * Whether to allow mention as a prefix.
         * @default false
         */
        mentionPrefix: boolean;
        /**
         * Whether to dynamically use the client's username as a prefix.
         * @default false
         */
        dynamicPrefix: boolean;
    },
    /**
     * Configuration options for managing command cooldowns.
     * @default undefined
     */
    CooldownConfig?: CooldownConfigOptions,
    /**
     * The MongoDB connection URI for the client's database.
     * @default undefined
     */
    MongoURI?: string,
    /**
     * The relative directory path where command modules are located.
     * @default "./commands"
     */
    commandsDir?: string,
    /**
     * The relative directory path where event modules are located.
     * @default "./events"
     */
    eventsDir?: string,
    /**
     * Configuration for identifying bot developers and specifying test environments.
     */
    DeveloperConfiguration?: {
        /**
         * An array of bot owners' Discord user IDs.
         */
        botOwners: string[];
        /**
         * An array of test server IDs for development purposes.
         * @default undefined
         */
        testServers?: string[];
    },
    /**
    * Indicates if detailed logging for debugging purposes is enabled.
    * This feature, when enabled, logs all internal actions within the handler to the console.
    * It is recommended to set this to `true` during initial setup and development to capture crucial startup information and other relevant operational details about the bot.
    * @default false
    */
    enableDetailedLogs?: boolean;

    /**
     * Optional list of feature flags to enable specific experimental features.
     * @default []
     */
    featureFlags?: string[];

        
}
