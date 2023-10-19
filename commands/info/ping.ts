import { EmbedBuilder, Message } from "discord.js"
import { CommandType } from "../../Main-Handler/ConfigHandler"
import { Callback, Command } from '../../typings';
import { MuteClass } from "../../classes/moderation/mute";
const muteClass = MuteClass.getInstance()
export default {
    name: "ping",
    description: "Replies with client ping",
    type: CommandType.legacy,
    cooldown: {
        Duration: '10s',
        Type: 'perUserCooldown'
    },
    aliases: ["whois"],
    callback: async ({ client, message, args }: Callback) => {
        message.reply(`Pong! Client websocket ping: **${client.ws.ping}ms**`)
    },
    extraInfo: {
        command_example: "?ping"
    }
} as Command