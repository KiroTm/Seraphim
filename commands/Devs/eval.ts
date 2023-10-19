import {  EmbedBuilder } from "discord.js";
import { CommandType } from "../../Main-Handler/ConfigHandler";
import { Callback, Command } from "../../typings";

export default {
    name: "eval",
    description: 'Replies with a PONG',
    ownersOnly: true,
    type: CommandType.legacy,
    callback: async ({ message, args}: Callback) => {
        if (message) {
            const result = args.join(" ");
        try {
            let noResultArg = new EmbedBuilder()
            .setColor("#e31212")
            .setDescription("ERROR: No valid eval args were provided")
            if (!result) return message.channel.send({
                embeds: [noResultArg]
            })
            let evaled = eval(result);            
            const resultSuccess = new EmbedBuilder()
            .setColor("#8f82ff")
            .setTitle("Success")
            // .addField(`Input:\n`, '```js\n' + `${args.join(" ").slice(5)}` + '```', false)
            // .addField(`Output:\n`, '```js\n' + evaled + '```', true)
            .addFields(
                { name: 'Input', value: '```ts\n' + `${result}` + '```' , inline: false } || undefined,
                { name: 'Output', value: '```ts\n' + `${evaled}` + '```' , inline: false } || undefined

            )
            message.channel.send({
                embeds: [resultSuccess]
            })
            
          } catch (error) {
            const resultError = new EmbedBuilder()
            .setColor("#e31212")
            .setTitle("An error has occured")
            .setDescription(`**Output:**\n\`\`\`${error}\`\`\` \n  Input:\n\`\`\`js\n ${result} \`\`\` `) || undefined
            await message.channel.send({
                embeds: [resultError]
            })
        }
        }
    }
} as Command
