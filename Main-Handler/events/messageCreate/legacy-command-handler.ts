import { ChannelType, Guild, GuildMember, Message, TextChannel } from "discord.js";
import { ConfigInstance } from "../../ConfigHandler";
import getLocalCommands from "../../utils/getLocalCommands";
import { Command } from "../../../typings";
import { CooldownManager } from "../../handlers/Cooldowns";
import ms from "ms";
import { CommandHandler } from "../../handlers/CommandHandler";

const localCommands = getLocalCommands();
const commandHandler = new CommandHandler();
const commandAliases = new Map<string, Command[]>();

localCommands.forEach((command) => {
  if (command.aliases) {
    command.aliases.forEach((alias) => {
      if (!commandAliases.has(alias)) {
        commandAliases.set(alias, []);
      }
      commandAliases.get(alias)!.push(command);
    });
  }
  commandAliases.set(command.name, [command]);
});

export default async (instance: ConfigInstance, message: Message) => {
  const prefix = instance._prefixHandler?.getPrefix(`${message.guildId}`) as string || "?"
  const Cooldowns = instance._cooldownsManager as CooldownManager
  if (!message.content.startsWith(prefix) || message.author.bot || message.channel.type !== ChannelType.GuildText || !message.guild || !message.member) return;
  if (Cooldowns.isUserIgnored(message.author.id)) return;
  const [commandName, ...args] = message.content.slice(prefix.length).split(/\s+/);
  const commandCandidates = commandAliases.get(commandName.toLowerCase()) || [];
  const command = commandCandidates.find((c) =>
    commandHandler.canRun(instance, c, message, args, prefix)
  ) as Command;
  if (!command) return;
  const { channel, author, member, guild } = message;
  
  if (command.cooldown) {
    if (Cooldowns.onCooldown(guild?.id!, member?.id!, author.id, command.name)) {
      Cooldowns.reply(message, author.id, command.name, command);
      Cooldowns.setCooldownMessage(message.author.id, command.name, message);
      return;
    }
    Cooldowns.set(guild.id, member, command, (command.cooldown.Type || 'perGuildCooldown'))
    }
  await commandHandler.run(command, { client: message.client, message, args, channel, user: author, member: member as GuildMember, instance, guild: guild as Guild, commands: localCommands, prefix}).catch(() => {
    message.channel.send("There was as error running this command, please make sure the bot has valid permissions!")
  })
};
