import { ChatInputCommandInteraction, GuildMember, Message } from 'discord.js';
import { ConfigInstance } from '../../NeoHandler/ConfigHandler';
import path from 'path';
import fs from 'fs';

export class Utils {
    /**
     * Converts a number to a string with commas as thousands separators.
     *
     * @param {number} num - The number to be formatted.
     * @returns {string} The formatted number as a string.
     */
    static formatNumber(num: number): string {
        return num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, ',');
    }

    /**
     * Recursively retrieves all files or folders within a given directory.
     *
     * @param {string} path_1 - The directory path to search.
     * @param {boolean} [folderOnly=false] - Whether to return only folders.
     * @returns {string[]} An array of file or folder paths.
     */
    static getAllFiles(path_1: string, folderOnly: boolean = false): string[] {
        const getAllFiles = (path1 = path_1, foldersOnly = folderOnly): string[] => {
            const files = fs.readdirSync(path1, { withFileTypes: true });
            let filesFound: string[] = [];
            for (const file of files) {
                const filePath = path.join(path1, file.name);
                if (file.isDirectory()) {
                    if (foldersOnly) {
                        filesFound.push(filePath);
                    } else {
                        filesFound = [...filesFound, ...getAllFiles(filePath)];
                    }
                } else {
                    filesFound.push(filePath);
                }
            }
            return filesFound;
        };
        return getAllFiles();
    }

    /**
     * Validates if a string is a valid hex color code.
     *
     * @param {string} hex - The hex color code to validate.
     * @returns {boolean} `true` if valid, otherwise `false`.
     */
    static isValidHex(hex: string): boolean {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
    }

    /**
     * Removes duplicate elements from an array or string.
     *
     * @param {string | any[]} inp - The input array or string.
     * @returns {string | any[]} The array or string with duplicates removed.
     */
    static removeDuplicates(inp: string | any[]): string | any[] {
        if (typeof inp === 'string') {
            return [...new Set(inp.split(' '))].join(' ');
        } else {
            return [...new Set(inp)];
        }
    }

    /**
     * Shuffles the elements of an array in place.
     *
     * @param {any[]} array - The array to shuffle.
     * @returns {any[]} The shuffled array.
     */
    static shuffleArray(array: any[]): any[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    /**
     * Truncates a string to a maximum length and adds '..' if truncated.
     *
     * @param {string} text - The input string.
     * @param {number} max_length - The maximum allowed length.
     * @returns {string} The truncated string with '..' appended if truncated.
     */
    static compressString(text: string, max_length: number): string {
        if (max_length >= text.length) return "null";
        return text.substring(0, max_length).trim() + "..";
    }

    /**
     * Converts a number to a compact format (e.g., 1900 to "1.9k").
     *
     * @param {number | string} num - The number to convert.
     * @returns {string} The number in compact format.
     */
    static toCompactNumber(num: number | string): string {
        if (typeof num === "number") {
            return new Intl.NumberFormat("en", { notation: "compact" }).format(num);
        } else if (typeof num === "string") {
            const abbrev = ["", "k", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc", "Ud", "Dd", "Td", "Qad", "Qid", "Sxd", "Spd", "Ocd", "Nod", "V"];
            const numValue = parseInt(num, 10);
            if (isNaN(numValue) || numValue < 0) {
                return "0";
            }
            if (numValue < 1000) {
                return numValue.toString();
            }
            const exponent = Math.min(Math.floor(Math.log10(numValue) / 3), abbrev.length - 1);
            const roundedNum = (numValue / Math.pow(10, exponent * 3)).toFixed(1);
            return `${roundedNum.replace(/\.0$/, "")}${abbrev[exponent]}`.replace(`${abbrev[abbrev.length - 1]}`, '');
        }
        return "0";
    }

    /**
     * Converts a string to kebab case (lowercase with hyphens).
     *
     * @param {string} str - The input string.
     * @returns {string} The string in kebab case.
     */
    static toKebabCase(str: string): string {
        return str.toLowerCase().replace(/\s+/g, '-');
    }

    /**
     * Converts a string to title case (capitalizing each word).
     *
     * @param {string} str - The input string.
     * @returns {string} The string in title case.
     */
    static toTitleCase(str: string): string {
        return str.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
        });
    }

    /**
     * Converts an array of permission flag bits to readable permissions.
     *
     * @param {any[]} permissions - The array of permission flag bits.
     * @returns {string[]} The array of readable permissions.
     */
    static getReadablePermissions(permissions: any[]): string[] {
        const formatPermission = (permission: string): string | undefined => {
            switch (permission) {
                case 'Administrator':
                    return 'Administrator';
                case 'BanMembers':
                    return 'Ban Members';
                case 'KickMembers':
                    return 'Kick Members';
                case 'ManageChannels':
                    return 'Manage Channels';
                case 'ManageMessages':
                    return 'Manage Messages';
                case 'ManageRoles':
                    return 'Manage Roles';
                case 'AddReactions':
                    return 'Add Reactions';
                case 'AttachFiles':
                    return 'Attach Files';
                case 'ChangeNickname':
                    return 'Manage Nicknames';
                case 'Connect':
                    return 'Connect';
                case 'CreateInstantInvite':
                    return 'Create Instant Invites';
                case 'CreatePrivateThreads':
                    return 'Create Private Threads';
                case 'CreatePublicThreads':
                    return 'Create Public Threads';
                case 'EmbedLinks':
                    return 'Embed Links';
                case 'ReadMessageHistory':
                    return 'Read Message History';
                case 'RequestToSpeak':
                    return 'Request to Speak';
                case 'SendMessages':
                    return 'Send Messages';
                case 'SendMessagesInThreads':
                    return 'Send Messages in Threads';
                case 'Speak':
                    return 'Speak';
                case 'Stream':
                    return 'Video';
                case 'UseApplicationCommands':
                    return 'Use Application Commands';
                case 'UseEmbeddedActivities':
                    return 'Use Embedded Activities';
                case 'UseExternalEmojis':
                    return 'Use External Emojis';
                case 'UseExternalStickers':
                    return 'Use External Stickers';
                case 'UseVAD':
                    return 'Use Voice Activity';
                case 'ViewChannel':
                    return 'View Channels';
            }
        };

        const descriptionList: string[] = [];
        const seen: Set<string> = new Set();

        for (const permission of permissions) {
            const description = formatPermission(permission);
            if (description && !seen.has(description)) {
                descriptionList.push(description);
                seen.add(description);
            }
        }
        return descriptionList;
    }

    /**
     * Validates command arguments.
     *
     * @param {any} command - The command object.
     * @param {string[]} args - The command arguments.
     * @param {string} prefix - The command prefix.
     * @param {Message} [message] - The message object.
     * @param {ChatInputCommandInteraction} [interaction] - The interaction object.
     * @returns {boolean} `true` if arguments are valid, otherwise `false`.
     */
    static checkArgs(command: any, args: string[], prefix: string = "?", message?: Message, interaction?: ChatInputCommandInteraction): boolean {
        if (!command.args) return true;

        const { minArgs = 0, maxArgs = -1, CustomErrorMessage = "Correct syntax: {PREFIX}{COMMAND} {ARGS}", expectedArgs = "" } = command.args;
        const { length } = args;

        if (length < minArgs || (length > maxArgs && maxArgs !== -1)) {
            const text = `Correct syntax:\n${CustomErrorMessage}`
                .replace("{PREFIX}", prefix)
                .replace("{COMMAND}", command.name)
                .replace("{ARGS}", expectedArgs);

            if (message) {
                message.reply(text).then((msg) => {
                    setTimeout(() => {
                        msg.delete().catch(() => { });
                    }, 1000 * 7);
                });
            } else if (interaction) {
                interaction.reply(text);
            }

            return false;
        }

        return true;
    }

    /**
     * Checks if a command is restricted to bot owners.
     *
     * @param {ConfigInstance} instance - The config instance.
     * @param {any} command - The command object.
     * @param {string} id - The user ID.
     * @returns {boolean} `true` if the command is restricted to bot owners, otherwise `false`.
     */
    static devOnly(instance: ConfigInstance, command: any, id: string): boolean {
        return !command.ownersOnly || instance._botOwners?.includes(id);
    }

    /**
     * Checks if a member has the required permissions to use a command.
     *
     * @param {Object} command - The command object.
     * @param {bigint[]} [command.permissions] - The required permissions.
     * @param {Message} [message] - The message object.
     * @param {ChatInputCommandInteraction} [interaction] - The interaction object.
     * @param {ConfigInstance} [instance] - The config instance.
     * @returns {boolean} `true` if the member has the required permissions, otherwise `false`.
     */
    static handleHasPermissions(command: { permissions?: bigint[] }, message?: Message, interaction?: ChatInputCommandInteraction, instance?: ConfigInstance): boolean {
        const member = (message ?? interaction)!.member as GuildMember;
        if (instance && instance._botOwners?.includes(member.user.id)) return true;
        const permissions = command.permissions || [];
        const text = `You can't use this command, use the help command to know more.`;
        if (permissions.length > 0 && permissions.some(permission => !member.permissions.has(permission))) {
            if (interaction) {
                interaction.reply({ content: text, ephemeral: true });
            }
            return false;
        }
        return true;
    }

    /**
     * Checks if a command has valid subcommands.
     *
     * @param {any} command - The command object.
     * @param {Message} message - The message object.
     * @param {string[]} args - The command arguments.
     * @returns {boolean} `true` if the command has valid subcommands, otherwise `false`.
     */
    static hasValidSubcommands(command: any, message: Message, args: string[]): boolean {
        return !command.subcommands?.length;
    }

    /**
     * Registers a handler for a specific type.
     *
     * @param {string} handlerType - The type of handler being registered.
     * @param {any} handler - The handler to be registered.
     */
    static registerHandler(handlerType: string, handler: any): void {
        const handlerRegistry: { [type: string]: any[] } = {};

        if (!handlerRegistry[handlerType]) {
            handlerRegistry[handlerType] = [];
        }

        handlerRegistry[handlerType].push(handler);
    }

    /**
     * Checks if the provided string is a valid URL.
     *
     * @param {string} str - The string to be tested as a URL.
     * @returns {boolean} `true` if the string is a valid URL, otherwise `false`.
     */
    static isValidURL = (str: string): boolean => /^(https?:\/\/)?([^\s$.?#].[^\s]*)$/i.test(str);

    /**
     * Generates a random alphabetic ID of specified length.
     *
     * @param {number} ID_LENGTH - The length of the ID to generate.
     * @returns {string} The generated ID.
     */
    static generateRandomAlphabeticID(ID_LENGTH: number): string {
        const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let randomID = '';

        for (let i = 0; i < ID_LENGTH; i++) {
            const randomIndex = Math.floor(Math.random() * ALPHABET.length);
            randomID += ALPHABET[randomIndex];
        }

        return randomID;
    }
}
