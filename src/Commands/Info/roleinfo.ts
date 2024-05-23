import { EmbedBuilder, Role } from "discord.js";
import { Callback, Command } from "../../../OldHandler/typings";
import { RoleClass } from "../../Classes/Misc/role";
import { CommandType } from "../../../OldHandler/ConfigHandler";

export default {
    name: "roleinfo",
    description: "Get a role's information",
    type: CommandType.legacy,
    cooldown: {
        Duration: '5s'
    },
    args: {
        minArgs: 1,
        maxArgs: -1,
        CustomErrorMessage: "?roleinfo @role/id/name"
    },
    callback: ({ message, args, guild }: Callback) => {
        const roleclass = new RoleClass()
        const role = roleclass.fetch(guild, args.join(' '), message) as Role
        if (!role) return message.channel.send({embeds: [new EmbedBuilder().setColor('Red').setDescription("Invalid Role!")]})
        const tags = roleclass.flags(role)
        message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(`${role.hexColor}`)
                    .setTitle(`${role.name}`)
                    .addFields(
                        { name: "ID", value: `${role.id || "Unknown"}`, inline: true },
                        { name: "Name", value: `${role.name || "Unknown"}`, inline: true },
                        { name: "Color", value: `${role.hexColor || "Default"}`, inline: true },
                        { name: "Mention", value: `\`<@&${role.id}>\``, inline: true },
                        { name: "Hoisted", value: `${role.hoist}`, inline: true },
                        { name: "Position", value: `${role.position}`, inline: true },
                        { name: "Mentionable", value: `${role.mentionable}`, inline: true },
                        { name: "Managed", value: `${role.managed}`, inline: true },
                        { name: "Permissions", value: (role.permissions.toArray().join(', ') || "None"), inline: false },
                        { name: "Tags", value: `${tags || "None"}`, inline: false}
                    )
            ]
        })
    },
    extraInfo: {
        command_example: "?roleinfo admin\n?roleinfo 1138806085365530717\n?roleinfo @Admin",
        command_usage: "?roleinfo <role>ª\nª: Can be either of: `Id, Mention, username\`"
    }
} as Command