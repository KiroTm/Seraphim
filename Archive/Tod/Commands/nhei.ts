import axios from "axios";
import { Callback, Command } from "../../../OldHandler/typings";
import { EmbedBuilder } from "discord.js";

export default {
    name: 'nhie',
    description: 'Never have i ever',
    aliases: ['neverhaveiever'],
    callback: async ({ message }: Callback) => {
        const url = `https://api.truthordarebot.xyz/api/nhie`;
        let response1, data1;
        response1 = await axios.get(url);
        data1 = response1.data;
        message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({
                        name: `Requested by ${message.author.username}`,
                        iconURL: `${message.author.displayAvatarURL({ forceStatic: false })}`
                    })
                    .setColor('Blue')
                    .setDescription(await data1.question)
                    .setFooter({
                        text: `Type: ${await data1.type} | Rating: ${await data1.rating} | Id: ${await data1.id}`
                    })
            ],
        })
    }
} as Command