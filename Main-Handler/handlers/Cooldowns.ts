import { GuildMember, Message } from "discord.js";
import { ConfigInstance } from "../ConfigHandler";
import { Command } from "../typings";
import ms from "ms";

export type CooldownsType = "perUserCooldown" | "perGuildCooldown";

export class CooldownManager {
	private static instance: CooldownManager | null = null;
	private perGuildCooldowns: Map<string, Map<string, number>> = new Map();
	private perUserCooldowns: Map<string, Map<string, number>> = new Map();
	private cooldownMessages: Map<string, boolean> = new Map();
	private ignoredUsers: Map<string, number> = new Map();
	private ignoredMessages: Map<string, number> = new Map();
	private CooldownConfig: CooldownConfigOptions = {};

	private constructor(_: ConfigInstance, CooldownConfigOptions: CooldownConfigOptions) {
		this.CooldownConfig = CooldownConfigOptions;
		setInterval(() => this.clearCooldownMessages(), 30 * 1000);
	}

	public static getInstance(instance: ConfigInstance, CooldownConfigOptions: CooldownConfigOptions): CooldownManager {
		return this.instance || (this.instance = new CooldownManager(instance, CooldownConfigOptions));
	}

	public setCooldownMessage(userId: string, commandName: string, message: Message) {
		const cooldownKey = `${userId}-${commandName}`;
		this.cooldownMessages.set(cooldownKey, true);
		setTimeout(() => this.cooldownMessages.delete(cooldownKey), 4000);
		if (this.CooldownConfig.RatelimitIgnore) {
			const messageCount = (this.ignoredMessages.get(userId) || 0) + 1;
			this.ignoredMessages.set(userId, messageCount);
			if (messageCount >= 15) {
				this.ignoreUser(userId, 60000, message);
				this.resetMessageCount(userId);
			}
		}
	}

	public set(guildId: string, member: GuildMember, command: Command, type: CooldownsType) {
		if (type == 'perGuildCooldown') {
			this.setPerGuildCooldown(guildId, member.user.id, command.name, ms(command.cooldown!.Duration));
		} else if (type == 'perUserCooldown') {
			this.setPerUserCooldown(member.user.id, command.name, ms(command.cooldown!.Duration));
		}
	}

	public onCooldown(guildId: string, memberId: string, userId: string, commandName: string): boolean {
		return (
			this.getPerGuildCooldown(guildId, memberId, commandName) > 0 ||
			this.getPerUserCooldown(userId, commandName) > 0 ||
			this.ignoredUsers.has(userId)
		);
	}

	public reply(message: Message, authorId: string, commandName: string, command: Command) {
		const cooldownKey = `${authorId}-${commandName}-messageCooldown`;
		if (!this.cooldownMessages.has(cooldownKey)) {
			this.cooldownMessages.set(cooldownKey, true);
			setTimeout(() => this.cooldownMessages.delete(cooldownKey), 7000);
			const SendWarning: boolean = command.cooldown?.SendWarningMessage !== false && this.CooldownConfig.SendWarningMessage !== false;
			if (SendWarning) {
				const msg = message.reply(`${command.cooldown?.CustomCooldownMessage || this.CooldownConfig.CustomErrorMessage || "A little too quick there! Wait {time}"}`.replace(/{time}/g, ''));
				setTimeout(() => msg.then((m) => m.delete().catch((er) => { })), 8000);
			}
		}
	}

	public removeCooldown(cooldownType: CooldownsType, message: Message, commandName: string) {
		const userID = message.author.id;
		const targetMap = cooldownType === 'perUserCooldown' ? this.perUserCooldowns : this.perGuildCooldowns;
		const targetKey = (cooldownType === 'perUserCooldown' ? userID : message.guildId) as string;

		const cooldowns = targetMap.get(targetKey);
		if (cooldowns) {
			cooldowns.delete(`${userID}-${commandName}`);
		}
	}

	public isUserIgnored(key: string) {
		return this.ignoredUsers.get(key)
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

export interface CooldownConfigOptions {
	SendWarningMessage?: boolean;
	OwnersBypass?: boolean;
	CustomErrorMessage?: string;
	RatelimitIgnore?: boolean;
}
