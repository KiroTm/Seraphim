import { UserClass } from "../../Classes/Misc/user";
import { Callback, Command } from "../../../Main-Handler/typings";
import { EmbedBuilder, User } from 'discord.js';
export default {
    name: 'meter',
    description: 'Meter',
    callback: async ({ message, client, args }: Callback) => {
        const subcommand = args[0]?.toLowerCase() ?? undefined;
        const subcommands = ["femboy", "racist", "rizz", "gay", "pp"]
        if (!subcommands.includes(subcommand)) return message?.channel?.send({ embeds: [new EmbedBuilder().setColor('Red').setDescription(`Invalid sub command provided. Must be one of ${subcommands.join(" | ")}`)] })
        const user = await (new UserClass().fetch(client, args[1] ?? message.author.id, message)) || message.author;
        message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor('Yellow')
                    .setAuthor({ name: client.user?.username!, iconURL: client.user?.displayAvatarURL() })
                    .setTitle(`${subcommand.charAt(0).toUpperCase() + subcommand.substring(1)}`)
                    .setDescription(getDescription(subcommand, user))

            ],
            allowedMentions: {
                roles: [],
                users: []
            }
        })
    },
    extraInfo: {
        command_usage: "{PREFIX} meter [subcommand] [user]",
        command_example: "{PREFIX} meter femboy @user",
        command_detailedExplaination: "This command allows you to measure various attributes about a user. You can use different subcommands to measure different attributes such as 'femboy', 'racist', 'rizz', 'gay', or 'pp' (penis size). If no user is mentioned, it defaults to the user who triggered the command. Here are some examples:\n\n- `{PREFIX} meter femboy @user`: Measures how much of a femboy the mentioned user is.\n- `{PREFIX} meter pp @user`: Measures the size of the mentioned user's 'pp' (penis size)."
    }

} as Command

function getDescription(Subcommand: string, member: User): string {
    const percentage = `${Math.floor(Math.random() * 100) + 1 + '%'}`
    const Placeholders = {
        femboy: `${member} is ${percentage} femboy`,
        racist: `${member} is ${percentage} racist`,
        rizz: `${member} has ${percentage} rizz`,
        gay: `${member} is ${percentage} gay`,
        pp: `${member}'s pp:\n8${"=".repeat(Math.floor(Math.random() * 10) + 1)}D`,
    }

    return Placeholders[Subcommand as keyof typeof Placeholders];
}