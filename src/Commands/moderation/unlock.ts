import { ChannelType, EmbedBuilder, Guild, PermissionFlagsBits } from "discord.js";
import { ChannelClass } from "../../Classes/Misc/channel";
import { Callback, Command } from "../../../Old-Handler/typings";
const channelClass = new ChannelClass();

export default {
    name: 'unlock',
    description: 'Unlocks the channel',
    permissions: [PermissionFlagsBits.ManageMessages],
    callback: async ({ message, args }: Callback) => {
        if (message) {
            const channel = message.mentions.channels.first() || channelClass.fetchChannel(message.guild as Guild, args[0] ?? message.channel.id) || message.channel;

            if (channel.type !== ChannelType.GuildText) {
                return message.channel.send({ embeds: [new EmbedBuilder().setColor('Green').setDescription('Channel must be a text type')] });
            }

            const permissions = channel.permissionsFor(message.guildId as string);
            if (permissions?.has(PermissionFlagsBits.SendMessages)) {
                return message.channel.send({ embeds: [new EmbedBuilder().setColor('Red').setDescription('Channel is already unlocked')] });
            }

            channel.permissionOverwrites.edit(message.guildId as string, {
                SendMessages: true
            });

            message.channel.send(`${channel} has been unlocked by ${message.author}`);
        }
    },
    extraInfo: {
        command_usage: "{PREFIX}unlock [channel]",
        command_example: "{PREFIX}unlock #general",
        command_detailedExplaination: "The `unlock` command allows moderators to unlock the specified channel, restoring users' ability to send messages. This command is useful when you want to lift restrictions on a previously locked channel. When executed, the command will unlock the mentioned channel or the current channel if no channel is mentioned. Note that the bot requires the 'Manage Messages' permission to execute this command successfully.\n\nUsage: {PREFIX}unlock [channel]\nExample: {PREFIX}unlock #general\n\nAfter executing the command, the bot will enable the permission to send messages in the specified channel, effectively unlocking it. It will then send a confirmation message indicating that the channel has been unlocked."
    }

} as Command;
