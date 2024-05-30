import { GuildMember, Message, ChannelType } from "discord.js";
import { ConfigInstance } from "../ConfigHandler";
import { Command } from "../typings";
import ms from "ms";

/**
 * Type representing the type of cooldowns.
 */
export type CooldownsType = "perUserCooldown" | "perGuildCooldown";

/**
 * Class responsible for managing command cooldowns.
 */
export class CooldownManager {
	/** 
	 * Static instance of the CooldownManager class. 
	 */
	private static instance: CooldownManager | null = null;
	/** 
	 * Map to store per-guild cooldowns. 
	 */
	private perGuildCooldowns: Map<string, Map<string, number>> = new Map();
	/** 
	 * Map to store per-user cooldowns. 
	 */
	private perUserCooldowns: Map<string, Map<string, number>> = new Map();
	/** 
	 * Map to store cooldown messages. 
	 */
	private cooldownMessages: Map<string, boolean> = new Map();
	/** 
	 * Map to store ignored users. 
	 */
	private ignoredUsers: Map<string, number> = new Map();
	/** 
	 * Map to store ignored messages. 
	 */
	private ignoredMessages: Map<string, number> = new Map();
	/** 
	 * Configuration options for cooldowns. 
	 */
	private CooldownConfig: CooldownConfigOptions = {};

	/**
	 * Creates an instance of CooldownManager.
	 * @param {ConfigInstance} instance - The configuration instance for the bot.
	 * @param {CooldownConfigOptions} CooldownConfigOptions - Configuration options for cooldowns.
	 */
	private constructor(_: ConfigInstance, CooldownConfigOptions: CooldownConfigOptions) {
		this.CooldownConfig = CooldownConfigOptions;
		// Periodically clear cooldown messages
		setInterval(() => this.clearCooldownMessages(), 30 * 1000);
	}

	/**
	 * Returns the singleton instance of CooldownManager.
	 * @param {ConfigInstance} instance - The configuration instance for the bot.
	 * @param {CooldownConfigOptions} CooldownConfigOptions - Configuration options for cooldowns.
	 * @returns {CooldownManager} - The CooldownManager instance.
	 */
	public static getInstance(instance: ConfigInstance, CooldownConfigOptions: CooldownConfigOptions): CooldownManager {
		return this.instance || (this.instance = new CooldownManager(instance, CooldownConfigOptions));
	}

	/**
	 * Sets a cooldown message for a specific user and command.
	 * @param {string} userId - The ID of the user.
	 * @param {string} commandName - The name of the command.
	 * @param {Message} message - The message triggering the cooldown.
	 */
	public setCooldownMessage(userId: string, commandName: string, message: Message): void {
		// Set cooldown message flag
		const cooldownKey = `${userId}-${commandName}`;
		this.cooldownMessages.set(cooldownKey, true);
		// Remove cooldown message after 4 seconds
		setTimeout(() => this.cooldownMessages.delete(cooldownKey), 4000);
		// Check for ratelimiting
		if (this.CooldownConfig.RatelimitIgnore) {
			const messageCount = (this.ignoredMessages.get(userId) || 0) + 1;
			this.ignoredMessages.set(userId, messageCount);
			// Ignore user if message count exceeds 15
			if (messageCount >= 15) {
				this.ignoreUser(userId, 60000, message);
				this.resetMessageCount(userId);
			}
		}
	}

	/**
	 * Sets a cooldown for a command.
	 * @param {string} guildId - The ID of the guild.
	 * @param {GuildMember} member - The guild member who triggered the command.
	 * @param {Command} command - The command object.
	 * @param {CooldownsType} type - The type of cooldown (perGuildCooldown or perUserCooldown).
	 */
	public set(guildId: string, member: GuildMember, command: Command, type: CooldownsType): void {
		if (type == 'perGuildCooldown') {
			this.setPerGuildCooldown(guildId, member.user.id, command.name, ms(command.cooldown!.Duration));
		} else if (type == 'perUserCooldown') {
			this.setPerUserCooldown(member.user.id, command.name, ms(command.cooldown!.Duration));
		}
	}

	/**
	 * Checks if a user or guild is on cooldown for a command.
	 * @param {string} guildId - The ID of the guild.
	 * @param {string} memberId - The ID of the member.
	 * @param {string} userId - The ID of the user.
	 * @param {string} commandName - The name of the command.
	 * @returns {boolean} - True if on cooldown, false otherwise.
	 */
	public onCooldown(guildId: string, memberId: string, userId: string, commandName: string): boolean {
		return (
			this.getPerGuildCooldown(guildId, memberId, commandName) > 0 ||
			this.getPerUserCooldown(userId, commandName) > 0 ||
			this.ignoredUsers.has(userId)
		);
	}

	/**
	 * Replies with a cooldown message for a command.
	 * @param {Message} message - The message triggering the cooldown.
	 * @param {string} authorId - The ID of the message author.
	 * @param {string} commandName - The name of the command.
	 * @param {Command} command - The command object.
	 * @returns {string | undefined} - The cooldown message.
	 */
	public reply(message: Message, authorId: string, commandName: string, command: Command): string | undefined {
		const cooldownKey = `${authorId}-${commandName}-messageCooldown`;
		if (!this.cooldownMessages.has(cooldownKey)) {
			this.cooldownMessages.set(cooldownKey, true);
			setTimeout(() => this.cooldownMessages.delete(cooldownKey), 7000);
			const SendWarning: boolean = command.cooldown?.SendWarningMessage !== false && this.CooldownConfig.SendWarningMessage !== false;
			if (SendWarning) {
				const content = this.getCooldownMessage(command, commandName, message)
				const msg = message.reply(content)
				setTimeout(() => msg.then((m) => m?.delete().catch(() => { })), 6000);
			}
		}
		return undefined;
	}

	/**
	 * Removes a cooldown for a user or guild.
	 * @param {CooldownsType} cooldownType - The type of cooldown to remove (perUserCooldown or perGuildCooldown).
	 * @param {Message} message - The message triggering the removal.
	 * @param {string} commandName - The name of the command.
	 */
	public removeCooldown(cooldownType: CooldownsType, message: Message, commandName: string): void {
		const userID = message.author.id;
		const targetMap = cooldownType === 'perUserCooldown' ? this.perUserCooldowns : this.perGuildCooldowns;
		const targetKey = (cooldownType === 'perUserCooldown' ? userID : message.guildId) as string;

		const cooldowns = targetMap.get(targetKey);
		if (cooldowns) {
			cooldowns.delete(`${userID}-${commandName}`);
		}
	}

	/**
	 * Checks if a user is ignored for ratelimiting.
	 * @param {string} key - The ID of the user.
	 * @returns {number | undefined} - The duration of the ignore.
	 */
	public isUserIgnored(key: string): number | undefined {
		return this.ignoredUsers.get(key);
	}

	private getCooldownMessage(command: Command, commandName: string, message: Message): string {
		const customMessage = command.cooldown?.CustomCooldownMessage || this.CooldownConfig.CustomErrorMessage || "A little too quick there! Wait {TIME}";
		return this.replacePlaceholders(customMessage, commandName, message);
	}

	private replacePlaceholders(MessageContent: string, commandName: string, message: Message): string {
		const Placeholders: { [key: string]: string } = {
			"{TIME}": this.getTimeLeft(message, commandName),
			"{USER}": message.author.username,
			"{CHANNEL}": (message.channel.type === 0 ? message.channel.name : 'Fancy'),
			"{GUILD}": message.guild?.name!,
		};

		return MessageContent.replace(/({\w+})/g, (match, placeholder) => {
			return Placeholders[placeholder] || match
		}
		);
	}

	private getTimeLeft(message: Message, commandName: string): string {
		const { author: { id }, guildId } = message
		const perUserCooldown = this.getPerUserCooldown(id, commandName);
		const perGuildCooldown = this.getPerGuildCooldown(guildId!, id, commandName);
		const remainingCooldown = Math.max(perUserCooldown, perGuildCooldown);
		return `${Math.ceil(remainingCooldown / 1000)} seconds`;
	}

	private setPerGuildCooldown(guildId: string, memberId: string, commandName: string, cooldownTime: number) {
		this.getOrCreateGuildCooldowns(guildId).set(`${memberId}-${commandName}`, Date.now() + cooldownTime);
	}

	private getPerGuildCooldown(guildId: string, memberId: string, commandName: string): number {
		const guildCooldowns = this.perGuildCooldowns.get(guildId);
		return guildCooldowns ? Math.max(0, (guildCooldowns.get(`${memberId}-${commandName}`) || 0) - Date.now()) : 0;
	}

	private setPerUserCooldown(userId: string, commandName: string, cooldownTime: number) {
		this.getOrCreateUserCooldowns(userId).set(commandName, Date.now() + cooldownTime);
	}

	private getPerUserCooldown(userId: string, commandName: string): number {
		const userCooldowns = this.perUserCooldowns.get(userId);
		return userCooldowns ? Math.max(0, (userCooldowns.get(commandName) || 0) - Date.now()) : 0;
	}

	private ignoreUser(userId: string, ignoreDuration: number, message: Message) {
		if (!this.CooldownConfig.RatelimitIgnore) return;
		this.ignoredUsers.set(userId, ignoreDuration);
		message.reply(`You're being ratelimited! ${message.client.user.username} will ignore your commands for 1 minute`);
		setTimeout(() => this.unignoreUser(userId), ignoreDuration);
	}

	private unignoreUser(userId: string) {
		this.ignoredUsers.delete(userId);
	}

	private resetMessageCount(userId: string) {
		this.ignoredMessages.delete(userId);
	}

	private getOrCreateGuildCooldowns(guildId: string): Map<string, number> {
		const guildCooldowns = this.perGuildCooldowns.get(guildId);
		if (guildCooldowns) {
			return guildCooldowns;
		} else {
			const newGuildCooldowns = new Map<string, number>();
			this.perGuildCooldowns.set(guildId, newGuildCooldowns);
			return newGuildCooldowns;
		}
	}

	private getOrCreateUserCooldowns(userId: string): Map<string, number> {
		const userCooldowns = this.perUserCooldowns.get(userId);
		if (userCooldowns) {
			return userCooldowns;
		} else {
			const newUserCooldowns = new Map<string, number>();
			this.perUserCooldowns.set(userId, newUserCooldowns);
			return newUserCooldowns;
		}
	}

	private clearCooldownMessages() {
		this.ignoredMessages.clear();
	}
}

/**
 * Interface representing configuration options for cooldowns.
 */
export interface CooldownConfigOptions {
	/** 
	 * Indicates whether to send warning messages for cooldowns. 
	 */
	SendWarningMessage?: boolean;
	/** 
	 * Indicates whether bot owners bypass cooldowns. 
	 */
	OwnersBypass?: boolean;
	/** 
	 * Custom error message for cooldowns. 
	 */
	CustomErrorMessage?: string;
	/** 
	 * Indicates whether to ignore ratelimiting. 
	 */
	RatelimitIgnore?: boolean;
}
