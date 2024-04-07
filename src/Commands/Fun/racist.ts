import { UserClass } from "../../Classes/Misc/user";
import { Callback, Command } from "../../../Main-Handler/typings";
import  { EmbedBuilder } from 'discord.js';
export default {
    name: 'racist',
    description: 'Racist meter',
    callback: async ({ message, client, args }: Callback) => {
        if (message) {
            const user = await (new UserClass().fetch(client, args[0] ?? message.author.id, message)) || message.author
            message.channel.send({
                embeds: [
                    new EmbedBuilder()
                    .setColor('Yellow')
                    .setAuthor({name: client.user?.username!, iconURL: client.user?.displayAvatarURL()})
                    .setTitle("Racist Meter")
                    .setDescription(`${user} is ${Math.floor(Math.random() * 100) + 1 + '%'} racist`)
                    
                ],
                allowedMentions: {
                    roles: [],
                    users: []
                }
            })
        }
    }
} as Command