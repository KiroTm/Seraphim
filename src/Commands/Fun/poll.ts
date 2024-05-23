import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { Callback, Command } from "../../../OldHandler/typings";

export default {
    name: 'poll',
    description: 'Make polls',
    permissions: [PermissionFlagsBits.ChangeNickname],
    callback: async ({ message, guild, args, instance }: Callback) => {
        const separator = "|"
        const findSep = args.find((char) => char.includes(separator));

        if (findSep === undefined) {
            const prefix = instance._prefixHandler?.getPrefix(guild.id)
            const embed1 = new EmbedBuilder()
                .setTitle(`Command: ${prefix}poll`)
                .setDescription(`**Description:** Make a poll (max 10 choice) \n **Cooldown:**  5 seconds \n **Usage** \n${prefix}poll Message ${separator} choice1 ${separator} choice2 \n **Example:**\n ${prefix}poll Who is your favourite soccer player? ${separator} Ronaldo ${separator} Messi`)
                .setColor('Blue')

            message.channel.send({
                embeds: [embed1]
            })
        }

        else {

            message.delete();

            const embed = new EmbedBuilder();
            const options = [];
            let j = 0;
            for (let i = 0; i < args.length; i++) {
                if (args[i] === separator) {
                    args.splice(i, 1);
                    const question = args.splice(0, i);
                    embed.setTitle(question.join(' '))
                    break;
                }
            }

            for (let i = 0; i < args.length; i++) {
                if (args[i] === separator) {
                    args.splice(i, 1);
                    options[j] = args.splice(0, i);
                    j++;
                    i = 0;
                }
            }

            const NUMBER = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']

            const arr: string[] = [];
            options[j] = args;

            if (options.length > NUMBER.length) {
                return await message.channel.send('You can\'t add more than 10 options!')

            }

            let count = 0;

            options.forEach(option => {
                arr.push(NUMBER[count] + ' ' + option.join(' '));
                count++;
            });

            embed
                .setDescription(arr.join('\n\n'))
                .setColor('Aqua');

            await message.channel.send({ embeds: [embed] }).then(async (msg: any) => {
                for (let i = 0; i < options.length; i++) {
                    await msg.react(NUMBER[i]);
                }
            });

        }
    },
    extraInfo: {
        command_usage: "{PREFIX}poll [message] | [choice1] | [choice2] ...",
        command_example: "{PREFIX}poll Who is your favorite soccer player? | Ronaldo | Messi",
        command_detailedExplaination: "This command allows you to create a poll with multiple choices. It supports up to 10 choices. You need to separate the message and choices using the '|' symbol. Here's how to use the command:\n\n- `{PREFIX}poll [message] | [choice1] | [choice2] ...`: Creates a poll with the given message and choices.\n\nFor example:\n- `{PREFIX}poll Who is your favorite soccer player? | Ronaldo | Messi`: Creates a poll asking for the favorite soccer player with choices Ronaldo and Messi."
    }

} as Command