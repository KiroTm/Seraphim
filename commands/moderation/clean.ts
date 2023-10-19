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
    callback: async ({message, args, guild, prefix, commands }: Callback) => {
        const bot = new MemberClass().fetch(guild, `${guild.members.me?.user.id}`) as GuildMember
        const channel = message.channel as TextChannel
        const messages = (await channel.messages.fetch({limit: 100}))
        const MessagesToDelete: Array<Message> = []
        messages.forEach((msg) => {
            if (msg.author.id == bot.id || msg.content.startsWith(prefix) && typeof commands.get(msg.content.split(' ')[0].substring(1)) == 'object') {
                MessagesToDelete.push(msg)
            }
        })
        channel.bulkDelete(MessagesToDelete).catch(() => {})
        message.channel.send(`Attempted to delete ${MessagesToDelete.length - 1} messages`)
    }
} as Command