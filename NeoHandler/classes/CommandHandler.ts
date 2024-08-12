import { ClientApplication, Collection, Guild, Message } from "discord.js";
import getLocalCommands from "../utils/getLocalCommands";
import { CommandType, ConfigInstance } from "../ConfigHandler";
import { Utils } from '../../Garnet/Utilities/Utils';
import { Command } from "../typings";

/**
 * Class responsible for handling commands.
 */
export class CommandHandler {
    /** 
     * Collection to store local commands. 
     */
    private localCommands = new Collection<string, Command>();

    /**
     * Reads command files from a directory and registers them as slash commands.
     * @param {ConfigInstance} instance - The configuration instance for the bot.
     * @param {string} commandsDir - The directory containing the command files.
     * @param {boolean} reloadSlash - Whether to reload slash commands.
     */
    async readFiles(instance: ConfigInstance, commandsDir: string, reloadSlash: boolean = false) {
        const { _chalk, _client, _testServers } = instance;
        this.localCommands = (await getLocalCommands(commandsDir))
        const slashCommands = this.localCommands.filter((c) => (typeof c.type !== 'undefined' && c.type !== CommandType.legacy))
        if (!reloadSlash) return;

        const application = _client?.application as ClientApplication;
        const commands = await application.commands.fetch();
        const promises: Promise<any>[] = [];

        slashCommands.each((commandObject, name) => {
            const { description, deleted, testServersOnly } = commandObject;
            const options = commandObject.options as any;
            const existingCommand = commands.find(c => c.name === name);

            if (existingCommand) {
                if (deleted) {
                    this.deleteCommand(application, name, _chalk);
                }
            } else {
                if (testServersOnly) {
                    const guildCommands = _testServers?.map(async (id: string) => {
                        const guild = _client?.guilds.cache.get(id) as Guild;
                        const exists = (await guild.commands.fetch()).find((c) => c.name === name);

                        if (deleted) {
                            if (exists) return this.deleteCommand(application, name, _chalk, { guild, id: exists.id });
                            else return console.log(_chalk.blueBright(`Skipping ${name} guild command since deleted is set to true.`));
                        }

                        console.log(_chalk.blueBright(`Creating guild command: ${name} for guild name: ${guild.name}.`));
                        return guild.commands.create({ name, description, options });
                    });

                    promises.push(...guildCommands || []);
                } else if (deleted) {
                    console.log(_chalk.blueBright(`Skipping ${name} global command since deleted is set to true.`));
                } else {
                    const commandData: any = { name };
                    if (description) commandData.description = description;
                    if (options?.length) commandData.options = options;
                    promises.push(application.commands.create(commandData));
                    console.log(_chalk.yellowBright(`Creating global slash command: ${name}.`));
                }
            }
        });
        await Promise.resolve(promises)
    }

    /**
     * Deletes a command from either global or guild-specific slash commands.
     * @param {ClientApplication} application - The client application.
     * @param {string} name - The name of the command to delete.
     * @param {any} _chalk - Chalk instance for logging.
     * @param {Object} guildCommand - Information about guild-specific command (optional).
     */
    private deleteCommand(application: ClientApplication, name: string, _chalk: any, guildCommand?: { guild: Guild, id: string }) {
        (guildCommand?.guild ?? application).commands.delete(guildCommand?.id ?? name);
        console.log(_chalk.redBright(`Deleting ${guildCommand ? `Guild Command for ${guildCommand.guild.name}` : "Global Command"}`));
    }

    /**
     * Checks if a command can be run.
     * @param {ConfigInstance} instance - The configuration instance for the bot.
     * @param {any} command - The command to check.
     * @param {Message} message - The message object.
     * @param {string[]} args - The command arguments.
     * @param {string} prefix - The command prefix.
     * @returns {boolean} - True if the command can be run, false otherwise.
     */
    public canRun(instance: ConfigInstance, command: any, message: Message, args: string[], prefix: string): boolean {
        const { devOnly, handleHasPermissions, checkArgs, hasValidSubcommands } = Utils
        if (hasValidSubcommands(command, message, args) === false) return false;
        if (devOnly(instance, command, message.author.id) === false) return false;
        if (handleHasPermissions(command, message, undefined, instance) === false) return false;
        if (checkArgs(command, args, prefix, message, undefined) === false) return false;
        return true;
    }

    /**
     * Executes a command callback.
     * @param {Command} command - The command to execute.
     * @param {any} callbackData - Data to pass to the command callback.
     * @param {Message} message - The message object.
     */
    public async run(command: Command, callbackData: any, message?: Message) {
        try {
            await command.callback(callbackData);
        } catch (error) {
            message?.channel?.send("There was an error running this command!").catch(() => { })
        }
    }

    /**
     * Retrieves local commands.
     * @returns {Collection<string, Command>} - Collection of local commands.
     */
    public getLocalCommands() {
        return this.localCommands;
    }

    /**
     * Retrieves all commands including aliases.
     * @param {Collection<string, Command>} localCommands - Collection of local commands (optional).
     * @returns {Collection<string, Command[]>} - Collection of command names mapped to their respective commands.
     */
    public getAllCommands(localCommands?: Collection<string, Command>) {
        localCommands = localCommands ?? this.getLocalCommands()
        const commandAliases = new Collection<string, Command[]>();
        localCommands.each((command) => {
            if (command.aliases) {
                command.aliases.forEach((alias) => {
                    if (!commandAliases.has(alias)) {
                        commandAliases.set(alias, []);
                    }
                    commandAliases.get(alias)!.push(command);
                });
            }
            commandAliases.set(command.name, [command]);
        });
        return commandAliases
    }
}
