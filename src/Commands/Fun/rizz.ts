import { UserClass } from "../../Classes/Misc/user";
import { Callback, Command } from "../../../Main-Handler/typings";
import  { EmbedBuilder } from 'discord.js';
export default {
    name: 'rizz',
    description: 'Rizz meter',
    callback: async ({ message, client, args }: Callback) => {
        if (message) {
            const user = await (new UserClass().fetch(client, args[0] ?? message.author.id, message)) || message.author
            message.channel.send({
                embeds: [
                    new EmbedBuilder()
                    .setColor('Yellow')
                    .setAuthor({name: client.user?.username!, iconURL: client.user?.displayAvatarURL()})
                    .setTitle("Rizz Meter")
                    .setDescription(`${user} has ${Math.floor(Math.random() * 100) + 1 + '%'} rizz`)
                    
                ],
                allowedMentions: {
                    roles: [],
                    users: []
                }
            })
        }
    }
} as Command