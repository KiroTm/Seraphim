import { ChannelType, Embed, EmbedBuilder, Guild, GuildMember, Message, TextChannel } from "discord.js";
import { ConfigInstance } from "../../ConfigHandler";
import { Command } from "../../typings";
import { CommandHandler } from "../../classes/CommandHandler";
import { CooldownManager } from "../../classes/Cooldowns";

export default async (instance: ConfigInstance, message: Message) => {
  if (message.author.bot || message.channel.type !== ChannelType.GuildText || !message.guild || !message.member) return;

  const localCommands = instance._commandHandler?.getLocalCommands();
  const allCommands = instance._commandHandler?.getAllCommands(localCommands)!;
  const commandHandler = new CommandHandler();
  const prefix = instance._prefixHandler?.getPrefix(`${message.guildId}`) as string;
  const Cooldowns = instance._cooldownsManager as CooldownManager;

  if (!message.content.startsWith(prefix) || Cooldowns.isUserIgnored(message.author.id)) return;

  const [commandName, ...args] = message.content.slice(prefix.length).split(/\s+/);
  const commandCandidates = allCommands.get(commandName.toLowerCase()) || [];
  const command = commandCandidates.find((c) => commandHandler.canRun(instance, c, message, args, prefix)) as Command;

  if (!command) return;

  const { channel, author, member, guild } = message;

  if (command.cooldown) {
    if (Cooldowns.onCooldown(guild?.id!, member?.id!, author.id, command.name)) {
      Cooldowns.reply(message, author.id, command.name, command);
      Cooldowns.setCooldownMessage(message.author.id, command.name, message);
      return;
    }

    Cooldowns.set(guild.id, member, command, (command.cooldown.Type || 'perGuildCooldown'));
  }

  commandHandler.run(command, {
    client: message.client,
    message,
    args,
    channel,
    user: author,
    member: member as GuildMember,
    instance,
    guild: guild as Guild,
    commands: localCommands,
    prefix
  }, message);
};
