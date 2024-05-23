import { CommandType } from "../../../OldHandler/ConfigHandler"
import { Callback, Command } from '../../../OldHandler/typings';
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
    },
    extraInfo: {
        command_example: "{PREFIX}ping"
    }
} as Command