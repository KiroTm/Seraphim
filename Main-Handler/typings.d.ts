import { ApplicationCommandOption, ChatInputCommandInteraction, Client, Collection, CommandInteraction, Events, Guild, GuildMember, Message, PermissionFlags, PermissionsBitField, TextChannel, User } from "discord.js";
import { CommandType, ConfigInstance } from "./ConfigHandler";
import { CooldownsType } from "./handlers/Cooldowns";
export interface Callback {
    client: Client,
    message: Message,
    interaction: ChatInputCommandInteraction,
    args: string[],
    guild: Guild,
    member: GuildMember,
    user: User,
    channel: TextChannel,
    instance: ConfigInstance
    commands: Collection<string, Command>
    prefix: string,
}

export interface Command {
    name: string
    description: string
    callback: Function
    aliases?: Array<string>
    type?: CommandType | CommandType.legacy,
    permissions?: Array<bigint>
    args?: { minArgs: number, maxArgs: number, CustomErrorMessage: string }
    cooldown?: { CustomCooldownMessage?: string, Duration: string, Type?: CooldownsType, SendWarningMessage?: boolean | true }
    options?: Array<ApplicationCommandOption>
    ownersOnly?: boolean | false
    testServersOnly?: boolean | false
    extraInfo?: { command_usage?: string, command_example?: string, command_detailedExplaination?: string },
    deleted?: boolean
}
