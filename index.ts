import { IntentsBitField, Partials, ClientOptions, TextChannel } from 'discord.js'
import { GarnetClient, GarnetClientOptions } from './Garnet/Framework/GarnetClient';
import { CacheLoaderOptions, ConfigHandler } from './NeoHandler/ConfigHandler';
import { LogLevel, Logger, SapphireClient } from '@sapphire/framework';
require("dotenv/config");
import { join } from 'path';
// B A S E  O P T I O N S

const baseoptions = {
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.DirectMessages,
    IntentsBitField.Flags.GuildMessageReactions,
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.GuildScheduledEvent,
    Partials.Reaction,
    Partials.ThreadMember,
    Partials.GuildMember,
  ],
  rest: {
    globalRequestsPerSecond: 9999
  },
  allowedMentions: {
    repliedUser: true,
    roles: [],
    parse: [],
  }
}

// S A P P H I R E  C L I E N T  O P T I O N S 

const sapphireClientOptions: ClientOptions = {
  ...baseoptions,
  baseUserDirectory: join(__dirname, './', 'src'),
  defaultPrefix: "s!",
  loadMessageCommandListeners: true,
  logger: new Logger(LogLevel.Info)
}

// S A P P H I R E  C L I E N T

export const sapphireClient = new SapphireClient(sapphireClientOptions);

// G A R N E T  C L I E N T

export const garnetClient = new GarnetClient(baseoptions as GarnetClientOptions);


// N E O - H A N D L E R 

garnetClient.on("ready", async (seraphim) => {
  garnetClient.setMaxListeners(Infinity);
  new ConfigHandler({
    client: seraphim,
    commandsDir: join(__dirname, './home', "Commands"),
    featuresDir: join(__dirname, './home', "Events"),
    mongoUri: process.env.MONGO_URI!,
      cacheOptions: [
        CacheLoaderOptions.Bans,
        CacheLoaderOptions.Channels,
        CacheLoaderOptions.Members,
        CacheLoaderOptions.Roles,
      ],
      DeveloperConfiguration: {
        testServers: ["1138806085352951950"],
        botOwners: ["919568881939517460"],
      },
      LegacyCommandConfiguration: {
        PrefixConfiguration: {
          defaultPrefix: "?",
          dynamicPrefix: true,
          mentionPrefix: true,
        },
        CooldownConfiguration: {
          SendWarningMessage: true,
          CustomErrorMessage: "A little too quick there! Wait {TIME}",
          OwnersBypass: true,
          RatelimitIgnore: true,
        }
      },
      SlashCommandConfiguration: {
        SyncSlashCommands: true
      }
    });
  
    process.on("uncaughtException", (error, origin) => { return; })
    process.on("unhandledRejection", (error, promise) => console.error(error));
});




// L O G G I N G 

sapphireClient.login(process.env.TOKEN);

garnetClient.login(process.env.TOKEN);
