import { ChannelType, EmbedBuilder, Guild, PermissionFlagsBits } from "discord.js";
import { ChannelClass } from "../../Classes/Misc/channel";
import { Callback, Command } from "../../../Main-Handler/typings";
const channelClass = new ChannelClass()
export default {
    name: 'lock',
    description: 'Locks the channel',
    permissions: [PermissionFlagsBits.ManageMessages],
    callback: async ({ message, args }: Callback) => {
        if (message) {
            const channel = message.mentions.channels.first() || channelClass.fetchChannel(message.guild as Guild, args[0] ?? message.channel.id) || message.channel
            if (channel.type !== ChannelType.GuildText) return message.channel.send({ embeds: [new EmbedBuilder().setColor('Green').setDescription('Channel must be a text type')] })

            const permissions = channel.permissionsFor(message.guildId as string);
            if (!permissions?.has(PermissionFlagsBits.SendMessages)) {
                return message.channel.send({ embeds: [new EmbedBuilder().setColor('Red').setDescription('Channel is already locked')] });
            }

            channel.permissionOverwrites.edit(message.guildId as string, {
                SendMessages: false
            })
            message.channel.send(`${channel} has been locked by ${message.author}`)
        }
    },
    extraInfo: {
        command_usage: "{PREFIX}lock [channel]",
        command_example: "{PREFIX}lock #general",
        command_detailedExplaination: "The `lock` command allows moderators to lock the specified channel to prevent users from sending messages. This can be useful in situations where you need to temporarily restrict communication in a channel, such as during maintenance or when dealing with disruptive users. When you run the command, it will lock the mentioned channel or the current channel if no channel is mentioned. Note that the bot requires the 'Manage Messages' permission to execute this command successfully.\n\nUsage: {PREFIX}lock [channel]\nExample: {PREFIX}lock #general\n\nAfter executing the command, the bot will disable the permission to send messages in the specified channel, effectively locking it. It will then send a confirmation message indicating that the channel has been locked."
    }

} as Command