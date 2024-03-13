import { Callback, Command } from "../../../typings";
import { ChannelClass } from "../../Classes/Misc/channel";
import { CommandType } from "../../../Main-Handler/ConfigHandler";
import { EmbedBuilder, PermissionFlagsBits, TextChannel } from "discord.js";
import ms from "enhanced-ms";
const C = new ChannelClass();
export default {
  name: "slowmode",
  description: "Sets slowmode for the given channel",
  type: CommandType.legacy,
  args: { minArgs: 1, maxArgs: -1, CustomErrorMessage: "{PREFIX}sm time channel" },
  aliases: ["sm", "slow"],
  permissions: [PermissionFlagsBits.ManageChannels],
  callback: async ({ message, args, guild }: Callback) => {
    const a = ms(args[0]) as number;
    const c = (C.fetchChannel(guild, `${args[1]}`, message) || message.channel) as TextChannel;
    if (!c || !a || a < 1e3 || a > 21.6e6) return message.channel.send({ embeds: [new EmbedBuilder().setColor("Red").setDescription(!c ? "Cannot find the specified channel." : "Invalid time provided, make sure the time is between 1s to 6hrs.")] });
    C.setSlowmode(c, a / 1e3);
    message.channel.send({ embeds: [new EmbedBuilder().setColor("Blue").setDescription(`**Slowmode of ${ms(a, {shortFormat: false})} has been set for ${c.name}**`)] });
    if (c !== message.channel) c.send({ embeds: [new EmbedBuilder().setColor("Blue").setDescription(`**A slowmode of ${ms(a, {shortFormat: false})} has been set for this channel**`)] });
  },
  extraInfo: {
    command_example: "{PREFIX}sm 1s\n{PREFIX}slow 1s #General",
    command_usage: "{PREFIX}slowmode time channel",
    command_detailedExplaination: "Slowmode command sets a \"cooldown\" for users in a specific channel, this command is helpful in preventing spamming to some extent. The channel parameter in this command is optional, the channel by default is channel the command is ran in."
  }
} as Command;
