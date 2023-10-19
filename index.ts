import { IntentsBitField, Client, Partials, ActivityType } from "discord.js";
  import { ConfigHandler, CacheLoaderOptions } from "./Main-Handler/ConfigHandler";
  import path from "path";
  const { Message, Channel, GuildScheduledEvent, Reaction, ThreadMember, GuildMember } = Partials;
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
	partials: [Message, Channel, GuildScheduledEvent, Reaction, ThreadMember, GuildMember],
	rest: {
	  globalRequestsPerSecond: Infinity,
	},
	presence: {
	  activities: [
		{ name: 'for ?help', type: ActivityType.Watching },
		{ name: "your queries", type: ActivityType.Listening },
	  ],
	  status: 'idle',
	},
  });
  
  client.on('ready', async (cli) => {
	new ConfigHandler({
	  client: cli,
	  botOwners: ["919568881939517460"],
	  commandsDir: path.join(__dirname, './', "commands"),
	  featuresDir: path.join(__dirname, './', 'events'),
	  mongoUri: `${process.env.MONGO_URI}`,
	//   SyncSlashCommands: true,
	  cacheOptions: [
		CacheLoaderOptions.Channels,
		CacheLoaderOptions.Members,
		CacheLoaderOptions.Roles,
		CacheLoaderOptions.Bans,
	  ],
	  CooldownConfiguration: {
		SendWarningMessage: true,
		CustomErrorMessage: 'A little too quick there!',
		OwnersBypass: true,
		RatelimitIgnore: true,
	  },
	});
  });
  
  client.login(process.env.TOKEN);
  
  process.on('uncaughtException', (err) => {
	console.error(`Uncaught Exception: ${err.stack}`);
  });

  process.on('unhandledRejection', (err) => {
	console.error("Unhandled Rejection:", err);
  });
  