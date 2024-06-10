import { PermissionFlagsBits } from 'discord.js'
import { SmashOrPassActionRow_Dropdown, SmashOrPassEmbed_Main } from "../../Classes/Misc/smashorpass";
import { CommandType } from "../../../NeoHandler/ConfigHandler";
import { Callback, Command } from "../../../NeoHandler/typings";

export default {
    name: "smash-or-pass",
    description: "Smash OR Pass",
    type: CommandType.slash,
    permissions: [PermissionFlagsBits.Administrator],
    callback: async ({ interaction }: Callback) => {
        interaction.reply({
            ephemeral: true,
            embeds: [SmashOrPassEmbed_Main],
            components: [SmashOrPassActionRow_Dropdown]
        })
    }
} as Command