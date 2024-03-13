import { EmbedBuilder } from "discord.js";
import { CommandType } from "../../Main-Handler/ConfigHandler"
import { Callback, Command } from '../../typings';
import { MuteClass } from "../../classes/moderation/mute";
export default {
    name: "ping",
    description: "Replies with client ping",
    type: CommandType.both,
    cooldown: {
        Duration: '3s',
        Type: 'perGuildCooldown'
    },
    callback: async ({ message, client, interaction }: Callback) => {
        interaction ? interaction.reply("Pong!") : message.channel.send(`${client.ws.ping}ms`)
        console.log(MuteClass.getInstance().mutes)
    },
    extraInfo: {
        command_example: "{PREFIX}ping"
    }
} as Command