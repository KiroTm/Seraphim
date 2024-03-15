import { ApplicationCommand, EmbedBuilder } from "discord.js";
import { CommandType } from "../../../Main-Handler/ConfigHandler";
import { Callback, Command } from "../../../Main-Handler/typings";

export default {
    name: "slash",
    description: "Moderate Slash Commands",
    ownersOnly: true,
    type: CommandType.legacy,
    callback: async ({message, args, client}: Callback) => {
        if (message) {
            const SubCommands = args[0];
            const Id = args[1];
            switch (SubCommands) {
                case "-" || "remove" || "delete": {
                    const command = (await client.application?.commands.fetch())!.find((c) => c.id === Id) as ApplicationCommand
                    if (!command) return message.channel.send("Invalid ID!")
                    const Embed = new EmbedBuilder().setColor('Blue').setDescription(`Command Deleted!\n\nID: ${command.id}\nName: ${command.name}\nDescription: ${command.description}`)
                    await command.delete()
                    await message.channel.send({
                        embeds: [Embed]
                    })
                }
                break;
            }
        }
    }
} as Command