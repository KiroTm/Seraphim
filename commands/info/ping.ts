import { EmbedBuilder } from "discord.js";
import { CommandType } from "../../Main-Handler/ConfigHandler"
import { Callback, Command } from '../../typings';
export default {
    name: "ping",
    description: "Replies with client ping",
    type: CommandType.both,
    cooldown: {
        Duration: '3s',
        Type: 'perGuildCooldown'
    },
    callback: async ({ client, message, interaction }: Callback) => {
        const ReplyObject = {
            embeds: [
                new EmbedBuilder()
                .setColor('Blue')
                .setAuthor({
                    iconURL: "https://media.discordapp.net/attachments/1162785970064740513/1166993264189120575/loading.gif",
                    name: 'Calculating ping....'
                })
            ]
        }
        const response = message ? await message.channel.send(ReplyObject) : await interaction.reply(ReplyObject)
        const ping = `Pong! Client websocket ping: **${client.ws.ping}ms**\n${message ? "Message" : "Interaction"} Roundtrip: **${response.createdTimestamp - (message ? message.createdTimestamp : interaction.createdTimestamp)}ms**`

        const EditObject = {
            embeds: [
                new EmbedBuilder(ReplyObject.embeds[0].data)
                .setAuthor({
                    name: `${client.user?.username}`,
                    iconURL: `${client.user?.displayAvatarURL()}`
                })
                .setDescription(ping)
            ]
        }
        message ? await response.edit(EditObject) : await interaction.editReply(EditObject)
    },
    extraInfo: {
        command_example: "{PREFIX}ping"
    }
} as Command