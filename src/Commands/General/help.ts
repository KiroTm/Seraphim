import { EmbedBuilder, GuildMember, APIEmbedField, TextChannel } from "discord.js";
import { CommandType } from "../../../Main-Handler/ConfigHandler";
import ms from "ms";
import { Callback, Command } from "../../../Main-Handler/typings";
import { ResponseClass } from "../../Classes/Utility/Response";
export default {
  name: "help",
  description: "Get a detailed explanation of each command",
  type: CommandType.legacy,
  cooldown: { Duration: '6s' },
  args: { minArgs: 1, maxArgs: 1, CustomErrorMessage: "{PREFIX}help command" },
  callback: async ({ message, args, commands, instance, prefix}: Callback) => {
    const aliasOrCommandName = args[0].toLowerCase();
    const command = commands.find((cmd) => cmd.name.toLowerCase() === aliasOrCommandName || (cmd.aliases && cmd.aliases.includes(aliasOrCommandName)));
    if (!command) return new ResponseClass().error(instance, message, { embeds: [new EmbedBuilder().setColor('Red').setDescription(`No such command: ${aliasOrCommandName}`)] }, {cooldownType: 'perGuildCooldown', commandName: 'help'})
    const { extraInfo, cooldown, aliases } = command;
    const bot = message.guild?.members.me as GuildMember;
    const commandType = (command: Command) => command.type === CommandType.both ? "Message & Slash" : command.type === CommandType.legacy ? "Message" : "Slash"
    const replacePlaceholders = (text: string) => text.replace(/\{PREFIX\}/g, `${prefix}`).replace(/\{COMMAND\}/g, `${command.name}`);
    const fieldsData = [
      extraInfo?.command_usage && { name: "📜 | **Command Usage**", value: replacePlaceholders(extraInfo.command_usage), inline: false },
      extraInfo?.command_detailedExplaination && { name: "🔎 | **Detailed Explanation**", value: replacePlaceholders(extraInfo.command_detailedExplaination), inline: false },
      extraInfo?.command_example && { name: "🔗 | **Examples**", value: replacePlaceholders(extraInfo.command_example), inline: false },
      aliases && { name: "📝 | **Aliases**", value: `**${aliases.join(", ")}**`, inline: false },
      cooldown && { name: "⏳ | **Cooldown**", value: `Duration: **${ms(ms(cooldown.Duration), { long: true })}**\nType: **${cooldown.Type == 'perUserCooldown' ? "Per User" : "Per Member"}**`, inline: false},
      {name:"🖇️ | **Type**", value: `${commandType(command)}`, inline: false}
    ].filter(Boolean) as APIEmbedField[];
    message.channel.send({ embeds: [new EmbedBuilder().setColor("#2B2D32").setAuthor({ name: bot.user.username, iconURL: bot.user.displayAvatarURL() }).setTitle(command.description as string).addFields(fieldsData)] });
  }
} as Command;
