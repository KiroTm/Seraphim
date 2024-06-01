import { ApplicationCommandOptionType, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { Callback, Command } from "../../../NeoHandler/typings";
import { CommandType } from "../../../NeoHandler/ConfigHandler";
import { PrefixHandler } from "../../../NeoHandler/classes/PrefixHandler";

export default {
  name: "prefix",
  description: "Set bot's prefix",
  permissions: [PermissionFlagsBits.Administrator],
  cooldown: { Duration: '10s', SendWarningMessage: true },
  type: CommandType.both,
  options: [{
    name: 'prefix',
    description: "Set guild's prefix",
    type: ApplicationCommandOptionType.String,
    required: false,
  }],
  callback: async ({ message, args, instance, interaction }: Callback) => {
    const prefixHandler = instance._prefixHandler as PrefixHandler;
    const key = (message ? message.guildId : interaction.guildId) as string;
    const prefixOption = message ? args[0] : interaction.options.getString('prefix') as string | undefined;
    
    const CurrenttPrefix = prefixHandler.getPrefix(key) as string;
    
    const replyObject = {
      embeds: [new EmbedBuilder().setColor('Blue').setDescription(prefixOption
        ? `The prefix has been set to : ${prefixOption}`
        : `The current prefix is: ${CurrenttPrefix}`
      )],
    };
    
    message ? message.channel.send(replyObject) : interaction.reply(replyObject);
    if (prefixOption) prefixHandler.setPrefix(key, prefixOption);
  },
  extraInfo: {
    command_usage: "{PREFIX}prefix [new_prefix]",
    command_example: "{PREFIX}prefix !",
    command_detailedExplaination: "This command allows administrators to set the bot's prefix for the guild. If a new prefix is provided, it will be set for the guild. If no new prefix is provided, it will display the current prefix for the guild."
  }  
} as Command;
