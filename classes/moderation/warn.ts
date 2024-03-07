import { GuildMember, Message } from "discord.js";
import warnSchema, { WarnDocument } from "../../models/warnSchema";
import { Collection } from "discord.js";
import { ModlogType, Modlogs } from "./modlogs";

const modlogs = Modlogs.getInstance();

export class WarnClass {
    private static instance: WarnClass;
    private readonly warnCollection: Collection<string, Collection<string, WarnDocument[]>>;

    private constructor() {
        this.warnCollection = new Collection();
        setInterval(this.updateDatabase.bind(this), 30000);
    }

    public static getInstance(): WarnClass {
        return this.instance || (this.instance = new WarnClass());
    }

    public async warn(member: GuildMember, staff: GuildMember, reason?: string): Promise<void> {
        const guildId = member.guild.id;
        const userId = member.user.id;

        const warnData: WarnDocument = new warnSchema({
            GuildID: guildId,
            UserID: userId,
            StaffID: staff.user.id,
            Reason: reason,
        });

        const guildWarns = this.warnCollection.get(guildId) || new Collection<string, WarnDocument[]>();
        const userWarns = guildWarns.get(userId) || [];
        userWarns.push(warnData);
        guildWarns.set(userId, userWarns);
        this.warnCollection.set(guildId, guildWarns);

        modlogs.create(member, staff!, ModlogType.Warn, reason ?? undefined);
        await warnSchema.create(warnData);
    }

    public async getWarns(member: GuildMember): Promise<WarnDocument[]> {
        const guildId = member.guild.id;
        const userId = member.user.id;

        const guildWarns = this.warnCollection.get(guildId);
        if (guildWarns) {
            const userWarns = guildWarns.get(userId);
            if (userWarns) {
                return userWarns;
            }
        }

        const warns = await warnSchema.find({ GuildID: guildId, UserID: userId });
        const userWarns = warns || [];
        const updatedGuildWarns = this.warnCollection.get(guildId) || new Collection<string, WarnDocument[]>();
        updatedGuildWarns.set(userId, userWarns);
        this.warnCollection.set(guildId, updatedGuildWarns);

        return userWarns;
    }

    public async clearWarns(member: GuildMember): Promise<void> {
        const guildId = member.guild.id;
        const userId = member.user.id;

        const guildWarns = this.warnCollection.get(guildId);
        if (guildWarns) {
            guildWarns.delete(userId);
        }

        await warnSchema.deleteMany({ GuildID: guildId, UserID: userId });
    }

    private async updateDatabase(): Promise<void> {
        for (const [guildId, userWarns] of this.warnCollection.entries()) {
            for (const [userId, warns] of userWarns.entries()) {
                await warnSchema.deleteMany({ GuildID: guildId, UserID: userId });
                await warnSchema.insertMany(warns);
            }
        }
    }
}
