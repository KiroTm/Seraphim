import { Client, Message, EmbedBuilder } from "discord.js";
import { CommandType } from "../../../Old-Handler/ConfigHandler";
import { Callback, Command } from "../../../Old-Handler/typings";

export default {
    name: "eval",
    description: 'Evaluate JavaScript code',
    ownersOnly: true,
    type: CommandType.legacy,
    callback: async ({ message, args, client }: Callback) => {
        if (!message) return;

        let code: string;
        let sendConfirmation = true;

        let lastArg = args[args.length - 1].toLowerCase();
        if (lastArg.endsWith("--s") || lastArg === "--this") {
            if (lastArg.endsWith("--s")) sendConfirmation = false;
            args.pop(); // Remove the flag from args
        }

        let subCommand: string | undefined;

        if (lastArg === "--this" && message.reference) {
            const repliedMessage = await message.channel.messages.fetch(message.reference.messageId!);
            subCommand = repliedMessage.content;
        } else {
            subCommand = args.join(" ");
        }

        if (!subCommand) {
            const embed = new EmbedBuilder()
                .setColor("#e31212")
                .setDescription("ERROR: No code provided to evaluate");
            return message.channel.send({ embeds: [embed] });
        }

        try {
            let result = eval(subCommand);
            if (typeof result !== "string") result = require("util").inspect(result);
            if (sendConfirmation) {
                const embed = new EmbedBuilder()
                    .setColor("#8f82ff")
                    .setTitle("Evaluation Success")
                    .addFields(
                        { name: 'Input', value: '```ts\n' + `${subCommand}` + '```' , inline: false },
                        { name: 'Output', value: '```ts\n' + `${result}` + '```' , inline: false }
                    );
                message.channel.send({ embeds: [embed] });
            }
        } catch (error) {
            const embed = new EmbedBuilder()
                .setColor("#e31212")
                .setTitle("An error occurred during evaluation")
                .setDescription(`**Output:**\n\`\`\`${error}\`\`\`\n**Input:**\n\`\`\`js\n${subCommand}\`\`\``);
            message.channel.send({ embeds: [embed] });
        }
    }
} as Command;
