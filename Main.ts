import { GarnetClient, GarnetClientOptions } from './Garnet/Framework/GarnetClient';
import { CacheLoaderOptions, ConfigHandler } from './NeoHandler/ConfigHandler';
import { IntentsBitField, Partials, ClientOptions } from 'discord.js'
import { LogLevel, Logger, SapphireClient } from '@sapphire/framework';
require("dotenv/config");
import path from 'path';
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


// G A R N E T  C L I E N T

export const garnetClient = new GarnetClient(baseoptions as GarnetClientOptions);


// N E O - H A N D L E R 

garnetClient.on("ready", async (seraphim) => {
    garnetClient.setMaxListeners(Infinity);
    new ConfigHandler({
      client: seraphim,
      commandsDir: path.join(__dirname, './home', "Commands"),
      featuresDir: path.join(__dirname, './home', "Events"),
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
        SyncSlashCommands: false
      }
    });
  
    process.on("uncaughtException", (error, origin) => { return; })
    process.on("unhandledRejection", (error, promise) => console.error(error));
});


// S A P P H I R E  H A N D L E R 

const sapphireClientOptions: ClientOptions = {
  ...baseoptions,
  loadMessageCommandListeners: true,
  baseUserDirectory: path.join("./src", __dirname),
  defaultPrefix: "s!",
  logger: new Logger(LogLevel.None)
}

export const sapphireClient = new SapphireClient(sapphireClientOptions);


// L O G G I N G 

sapphireClient.login(process.env.TOKEN)

garnetClient.login(process.env.TOKEN)