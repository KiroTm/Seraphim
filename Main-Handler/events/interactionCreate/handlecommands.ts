import { Interaction, Client, GuildMember, TextChannel, User } from "discord.js";
import { ConfigInstance } from "../../ConfigHandler";
import getLocalCommands from "../../utils/getLocalCommands";
import { Command } from "../../../typings";
import { Utils } from "../../../functions/Utils";
const localCommands = getLocalCommands();
export default async (instance: ConfigInstance, interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;      
    const command = localCommands.get(interaction.commandName) as Command    
    if (!command || Utils.devOnly(instance, command, interaction.user.id) == false || Utils.HandlehasPermissions(command, undefined, interaction) == false) return;
    const client = instance._client as Client
    const member = interaction.member as GuildMember
    const user = interaction.user as User
    const channel = interaction.channel as TextChannel
    const Callback = {
        client,
        interaction,
        channel,
        user,
        member,
        instance
    }
    await command.callback(Callback) 
}
