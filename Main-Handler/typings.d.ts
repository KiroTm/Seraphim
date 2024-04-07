/**
 * Represents a callback function for handling commands.
 */
export interface Callback {
    /** 
     * The Discord client instance. 
     * This represents the Discord bot's client object, which allows interaction with the Discord API.
     */
    client: Client,
    /** 
     * The message object that triggered the command. 
     * This represents the message that initiated the command, providing information about the message content, author, etc.
     */
    message: Message,
    /** 
     * The interaction object containing the command. 
     * This represents the interaction event that contains the command, particularly for slash commands.
     */
    interaction: ChatInputCommandInteraction,
    /** 
     * The arguments provided with the command. 
     * These are the additional parameters passed with the command, which can be used by the command handler.
     */
    args: string[],
    /** 
     * The guild where the command was triggered. 
     * This represents the Discord server (guild) where the command was executed.
     */
    guild: Guild,
    /** 
     * The member who triggered the command. 
     * This represents the Discord member (user) who initiated the command within the guild.
     */
    member: GuildMember,
    /** 
     * The user who triggered the command. 
     * This represents the Discord user who initiated the command, irrespective of the guild.
     */
    user: User,
    /** 
     * The channel where the command was triggered. 
     * This represents the Discord channel where the command was executed.
     */
    channel: TextChannel,
    /** 
     * The configuration instance for the bot. 
     * This contains various configurations and handlers for the bot's functionality.
     */
    instance: ConfigInstance,
    /** 
     * Collection of available commands. 
     * This is a collection of all registered commands, accessible for command processing and execution.
     */
    commands: Collection<string, Command>
    /** 
     * The prefix used for the command invocation. 
     * This is the string used before the command name to invoke a command, e.g., "!command".
     */
    prefix: string,
}

/**
 * Represents a Discord bot command.
 */
export interface Command {
    /** 
     * The name of the command. 
     * This is the unique identifier for the command, by which it is invoked.
     */
    name: string
    /** 
     * The type of command. 
     * This specifies the type of command, determining its behavior and usage.
     */
    type?: CommandType | CommandType.legacy,
    /** 
     * Arguments configuration for the command. 
     * This defines the minimum and maximum number of arguments the command expects, along with a custom error message.
     */
    args?: { minArgs: number, maxArgs: number, CustomErrorMessage: string }
    /** 
     * The function to execute when the command is triggered. 
     * This is the function that gets executed when the command is invoked, performing the command's actions.
     */
    callback: Function
    /** 
     * Options for slash commands. 
     * These are the options associated with the slash command, defining its parameters and behavior.
     */
    options?: Array<ApplicationCommandOption>
    /** 
     * Indicates whether the command is deleted or not. 
     * This flag indicates whether the command is marked as deleted or not, affecting its availability.
     */
    deleted?: boolean
    /** 
     * Aliases for the command. 
     * These are alternative names by which the command can be invoked, providing flexibility in command usage.
     */
    aliases?: Array<string>
    /** 
     * Cooldown settings for the command. 
     * This defines the cooldown settings for the command, regulating the frequency of command usage.
     */
    cooldown?: { CustomCooldownMessage?: string, Duration: string, Type?: CooldownsType, SendWarningMessage?: boolean | true }
    /** 
     * Additional information about the command. 
     * This provides extra information about the command, such as usage examples or detailed explanations.
     */
    extraInfo?: { command_usage?: string, command_example?: string, command_detailedExplaination?: string }
    /** 
     * Indicates if the command is restricted to bot owners only. 
     * This flag restricts command usage to bot owners only, enhancing security and control.
     */
    ownersOnly?: boolean | false
    /** 
     * Description of the command. 
     * This provides a brief description of the command, explaining its purpose or functionality.
     */
    description: string
    /** 
     * Required permissions to use the command. 
     * This specifies the permissions required by users to execute the command successfully.
     */
    permissions?: Array<bigint>
    /** 
     * Subcommands associated with the command. 
     * These are subcommands associated with the main command, allowing for hierarchical command structures.
     */
    subcommands?: Array<string>
    /** 
     * Indicates if the command can only be used in test servers. 
     * This flag limits the usage of the command to test servers only, useful for development and testing purposes.
     */
    testServersOnly?: boolean | false
}
