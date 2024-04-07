import { IntentsBitField, Client, Partials, ActivityType } from 'discord.js'
import { ConfigHandler, CacheLoaderOptions } from "./Main-Handler/ConfigHandler";
import path from "path";
import figlet from 'figlet';
const { Channel, GuildScheduledEvent, Reaction, ThreadMember, GuildMember } = Partials;
require("dotenv/config");

export const client = new Client({
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
    Channel,
    GuildScheduledEvent,
    Reaction,
    ThreadMember,
    GuildMember,
  ],
  shards: 'auto',
  rest: {
    globalRequestsPerSecond: 9999
  },
  presence: {
    activities: [
      { name: "for ?help", type: ActivityType.Watching },
      { name: "your queries", type: ActivityType.Listening },
    ],
    status: "idle",
  },
  allowedMentions: {
    repliedUser: true,
    roles: [],
    parse: [],
  },
});

client.on("ready", async (seraphim) => {
  const chalk = (await import("chalk")).default;
  client.setMaxListeners(Infinity);
  new ConfigHandler({
    chalk,
    client: seraphim,
    figlet: figlet,
    commandsDir: path.join(__dirname, './src/', "Commands"),
    featuresDir: path.join(__dirname, './src/', "Events"),
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
        dynamicPrefix: true
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

client.login(process.env.TOKEN);
