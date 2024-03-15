import { Interaction, Client, GuildMember, TextChannel, User, EmbedBuilder } from "discord.js";
import { ConfigInstance } from "../../ConfigHandler";
import getLocalCommands from "../../utils/getLocalCommands";
import { Command } from "../../typings";
import { Utils } from "../../utils/Utils";
export default async (instance: ConfigInstance, interaction: Interaction) => {
    const localCommands = instance._commandHandler?.getLocalCommands()!
    if (!interaction.isChatInputCommand()) return;
    const command = localCommands.get(interaction.commandName) as Command
    if (!command || Utils.devOnly(instance, command, interaction.user.id) == false || Utils.HandlehasPermissions(command, undefined, interaction, instance) == false) return;
    const client = instance._client as Client
    const member = interaction.member as GuildMember
    const user = interaction.user as User
    const channel = interaction.channel as TextChannel
    await command.callback({client, interaction, channel, user, member, instance})
}
