import { IntentsBitField, Client, Partials, ActivityType } from 'discord.js'
import { ConfigHandler, CacheLoaderOptions } from "./Main-Handler/ConfigHandler";
import path from "path";
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
  rest: {
    globalRequestsPerSecond: 9999,
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
  },
});

client.on("ready", async (seraphim) => {
  const chalk = (await import("chalk")).default;
  client.setMaxListeners(Infinity);
  new ConfigHandler({
    client: seraphim,
    botOwners: ["919568881939517460"],
    commandsDir: path.join(__dirname, './src/', "Commands"),
    featuresDir: path.join(__dirname, './src/', "Events"),
    mongoUri: `${process.env.MONGO_URI}`,
      // SyncSlashCommands: true,
    cacheOptions: [
      CacheLoaderOptions.Channels,
      CacheLoaderOptions.Members,
      CacheLoaderOptions.Roles,
      CacheLoaderOptions.Bans,
    ],
    CooldownConfiguration: {
      SendWarningMessage: true,
      CustomErrorMessage: "A little too quick there!",
      OwnersBypass: true,
      RatelimitIgnore: true,
    }
  });

  process.on("uncaughtException", (error, origin) => {
    console.log(
      chalk.redBright(
        `Uncaught Exception: ${error.message}\nOrigin: ${origin}`,
      ),
    );
  });

  process.on("unhandledRejection", (error, promise) => {
    console.log(
      chalk.redBright(`Unhandled Rejection - ${error}\nPromise: ${promise.catch((e) => console.log(e))}`),
    );
  });
});

client.login(process.env.TOKEN);
