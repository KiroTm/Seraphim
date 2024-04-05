import { ClientApplication, Collection, Guild, Message } from "discord.js";
import { CommandType, ConfigInstance } from "../ConfigHandler";
import { Utils } from '../utils/Utils';
import getLocalCommands from "../utils/getLocalCommands";
import { Command } from "../typings";

export class CommandHandler {
    private localCommands = new Collection<string, Command>();

    public instance!: ConfigInstance;

    async readFiles(instance: ConfigInstance, commandsdir: any, reloadslash?: boolean | false) {
        const { _chalk, _client } = instance;
        this.localCommands = await getLocalCommands(commandsdir);
        if (!reloadslash) return;
        const slashcommands = this.localCommands.filter(c => typeof c.type !== 'undefined' && c.type !== CommandType.legacy);
        console.log(`${_chalk.bold.white(`➙ Iterating through ${slashcommands.size} slash commands...`)}`);
        const application = instance._client?.application as ClientApplication;
        const commands = await application.commands.fetch();
        const promises = [];
        for (const [name, commandObject] of slashcommands) {
            const description = commandObject.description;
            const options = commandObject.options as any;
            const existingCommand = commands.find(c => c.name === name);
            if (existingCommand) {
                if (commandObject.deleted) {
                    this.deleteCommand(application, _chalk, name)
                }
            } else {
                if (commandObject.testServersOnly) {
                    promises.push(
                        ...instance._testServers?.map(async (id: string) => {
                            const guild = _client?.guilds.cache.get(id) as Guild;
                            const exists = (await guild.commands.fetch()).find((c) => c.name === name);
                            if (commandObject.deleted) {
                                if (exists) return this.deleteCommand(application, name, _chalk, { guild, id: exists.id });
                                else return console.log(_chalk.blueBright(`Skipping ${name} guild command since deleted is set to true.`));
                            }
                            console.log(_chalk.blueBright(`Creating guild command: ${name} for guild name: ${guild.name}.`));
                            return await guild.commands.create({ name, description, options });
                        }) || []);
                } else if (commandObject.deleted === true) {
                    console.log(`Skipping ${name} command since deleted is set to true.`);
                } else {
                    promises.push(application.commands.create({ name, description, options }));
                    console.log(_chalk.yellowBright(`Creating global slash command: ${name}.`));
                }
            }
        }

        await Promise.allSettled(promises);
    }

    private deleteCommand(application: ClientApplication, name: string, _chalk: any, guildCommand?: { guild: Guild, id: string }) {
        (guildCommand?.guild ?? application).commands.delete(guildCommand?.id ?? name);
        console.log(_chalk.redBright(`Deleting ${guildCommand ? `Guild Command for ${guildCommand.guild.name}` : "Global Command"}`));
    }

    public canRun(instance: ConfigInstance, command: any, message: Message, args: string[], prefix: string): boolean {
        const { devOnly, HandlehasPermissions, CheckArgs } = Utils
        if (devOnly(instance, command, message.author.id) === false) return false;
        if (HandlehasPermissions(command, message, undefined, instance) === false) return false;
        if (CheckArgs(command, args, prefix, message, undefined) === false) return false;
        return true;
    }

    public async run(command: Command, callbackData: any) {
        await command.callback(callbackData);
    }

    public getLocalCommands() {
        return this.localCommands;
    }

    public getAllCommands(localCommands?: Collection<string, Command> | undefined) {
        localCommands = localCommands ?? this.getLocalCommands()
        const commandAliases = new Collection<string, Command[]>();
        localCommands.forEach((command) => {
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