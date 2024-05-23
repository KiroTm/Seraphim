import { EmbedBuilder, GuildMember, Message, PermissionFlagsBits, TextChannel } from "discord.js";
import { CommandType } from "../../../Old-Handler/ConfigHandler";
import { Callback, Command } from "../../../Old-Handler/typings";
import { MemberClass } from "../../Classes/Misc/member";

export default {
    name: "clean",
    description: "Cleans bot messages",
    type: CommandType.legacy,
    permissions: [
        PermissionFlagsBits.ManageMessages
    ],
    cooldown: {
        Duration: '5s'
    },
    callback: async ({ message, args, guild, prefix, commands }: Callback) => {
        const bot = new MemberClass().fetch(guild, `${guild.members.me?.id}`) as GuildMember;
        const channel = message.channel as TextChannel;
        const messages = await channel.messages.fetch({ limit: 100 });
        const MessagesToDelete = messages.filter(msg => msg.author.id === bot.id || (msg.content.startsWith(prefix)));
        await channel.bulkDelete(MessagesToDelete).catch(() => { });
        message.channel.send(`Attempted to delete ${MessagesToDelete.size - 1} messages`).then((msg) => setTimeout(() => { msg.delete() }, 5000))
    },
    extraInfo: {
        command_usage: "{PREFIX}clean",
        command_example: "{PREFIX}clean",
        command_detailedExplaination: "The `clean` command allows you to remove bot messages and command invocations from the current channel. It helps in keeping the channel tidy by eliminating unnecessary clutter. When you run the command, it will delete bot messages and commands issued by users with the bot's prefix, up to the last 100 messages in the channel. Note that the bot requires the 'Manage Messages' permission to execute this command successfully.\n\nUsage: {PREFIX}clean\nExample: {PREFIX}clean\n\nAfter executing the command, it will attempt to delete the identified messages and provide a confirmation message indicating the number of messages deleted. This confirmation message will automatically disappear after 5 seconds to avoid further clutter."
    }

} as Command;
