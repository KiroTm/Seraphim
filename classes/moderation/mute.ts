import { Guild, GuildMember, Message, Role, TextChannel, MessageCreateOptions, EmbedBuilder, Collection } from "discord.js";
import muteSchema from "../../models/mute-schema";
import { client } from '../../index';
import { ModlogType, Modlogs } from "./modlogs";
const Modlog = Modlogs.getInstance()
type muteobject = {
    Reason: string
    roles: Array<string>
    ExpiresAt: number
}
export class MuteClass {
    private static instance: MuteClass;
    private readonly timer: NodeJS.Timeout;
    private constructor() {
        this.timer = setInterval(this.checkMutes.bind(this), 10 * 1000)
    }
    public static getInstance(): MuteClass {
        return this.instance || (this.instance = new MuteClass());
    }

    public async mute(message: Message, member: GuildMember, mutedrole: Role, reason: string, time?: number | null): Promise<any> {
        const roles = Array.from(member.roles.cache.keys())
        muteSchema.create({ GuildID: member.guild.id, UserID: member.user.id, Reason: reason, roles, expiresAt: time })
        const filteredroles = member.roles.cache.filter((r) => r.tags?.botId || r.tags?.availableForPurchase || r.tags?.subscriptionListingId || r.tags?.premiumSubscriberRole || r.tags?.guildConnections).keys()
        member.roles.set([...filteredroles, mutedrole]).catch((error) => {});
        Modlog.create(member, message.member as GuildMember, ModlogType.Mute, reason)
        return true;
    }

    private async checkMutes() {
        try {
            const expiredMutes = await muteSchema.find({ expiresAt: { $lt: Date.now() } });
            for (const mute of expiredMutes) {
                const guild = client.guilds.cache.get(mute.GuildID);
                if (!guild) continue;

                const member = await guild.members.fetch(mute.UserID).catch(() => null);
                if (!member) continue;

                const mutedRole = guild.roles.cache.find((role) => role.name.toLowerCase() === 'muted');
                if (!mutedRole) continue;
                this.removeMutes(member, mutedRole);
            }
        } catch (er) {
            return;
        }
    }

    private async removeMutes(member: GuildMember, mutedRole: Role) {
        try {
            const schema = await muteSchema.findOneAndDelete({
                GuildID: member.guild.id,
                UserID: member.user.id,
                expiresAt: { $lt: Date.now() }
            })
            member.roles.set(schema.roles);
        } catch (error) {
            return;
        }
    }

    public async isMuted(member: GuildMember, MutedRole: Role, deleteDoc?: boolean | false) {
        if (member.roles.cache.has(MutedRole.id)) return true
        const doc = await this.hasMute(member, deleteDoc)
        return doc ?? false
    }

    public async hasMute(member: GuildMember, deleteDoc: boolean = false) {
        const doc = deleteDoc
            ? await muteSchema.findOneAndDelete({
                GuildID: member.guild.id,
                UserID: member.user.id
            })
            : await muteSchema.findOne({
                GuildID: member.guild.id,
                UserID: member.user.id
            });

        return doc ?? false
    }
}