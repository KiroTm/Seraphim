import { createTranscript } from "discord-html-transcripts";
import { CommandType } from "../../../NeoHandler/ConfigHandler";
import { Callback, Command } from "../../../NeoHandler/typings";

export default {
    name: "transcript",
    description: "Get transcript of a channel",
    type: CommandType.legacy,
    ownersOnly: true,
    callback: async ({ message, channel }: Callback) => {
        try {
            const messages = await channel.messages.fetch({
              limit: 100
            })
            message.channel.send(`${messages.size}`)
            const Attachment = await createTranscript(channel)
            message.channel.send({files: [Attachment]})
        } catch (err) {
            console.log(err)
        }
    }
} as Command