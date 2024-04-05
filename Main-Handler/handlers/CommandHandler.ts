import { ClientApplication, Collection, Guild, Message } from "discord.js";
import getLocalCommands from "../utils/getLocalCommands";
import { ConfigInstance } from "../ConfigHandler";
import { Utils } from '../utils/Utils';
import { Command } from "../typings";

export class CommandHandler {
    private localCommands = new Collection<string, Command>();

    async readFiles(instance: ConfigInstance, commandsDir: string, reloadSlash: boolean = false) {
        const { _chalk, _client, _testServers } = instance;
        this.localCommands = await getLocalCommands(commandsDir);
        if (!reloadSlash) return;

        const application = _client?.application as ClientApplication;
        const commands = await application.commands.fetch();
        const promises: Promise<any>[] = [];

        this.localCommands.each((commandObject, name) => {
            const { description, deleted, testServersOnly } = commandObject;
            const options = commandObject as any
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
                } else if (!deleted) {
                    promises.push(application.commands.create({ name, description, options }));
                    console.log(_chalk.yellowBright(`Creating global slash command: ${name}.`));
                }
            }
        });

        Promise.allSettled(promises)
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

    public async run(command: Command, callbackData: any, message?: Message) {
        try {
            await command.callback(callbackData);
        } catch (error) {
            message?.channel?.send("There was an error running this command!").catch(() => { })
        }
    }

    public getLocalCommands() {
        return this.localCommands;
    }

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