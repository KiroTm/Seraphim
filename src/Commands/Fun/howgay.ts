import { UserClass } from "../../Classes/Misc/user";
import { Callback, Command } from "../../../typings";

export default {
    name: 'howgay',
    description: 'Gay meter',
    aliases: ['hg', 'gayrate'],
    callback: async ({ message, client, args }: Callback) => {
        if (message) {
            const user = await (new UserClass().fetch(client, args[0] ?? message.author.id, message)) || message.author
            message.channel.send({
                content: `# Gay rate machine 🏳️‍🌈\n${user} is estimated to be ${Math.floor(Math.random() * 100) + 1 + '%'} gay`,
                allowedMentions: {
                    roles: [],
                    users: []
                }
            })
        }
    }
} as Command