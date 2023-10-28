import { EmbedBuilder, GuildMember, Message, PermissionFlagsBits, TextChannel } from "discord.js";
import { CommandType } from "../../Main-Handler/ConfigHandler";
import { Callback, Command } from "../../typings";
import { MemberClass } from "../../classes/misc/member";

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
        await channel.bulkDelete(MessagesToDelete).catch(() => {});
        message.channel.send(`Attempted to delete ${MessagesToDelete.size - 1} messages`);
    }
} as Command;
