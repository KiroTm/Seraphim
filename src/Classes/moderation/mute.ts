import { GuildMember, Role, Collection } from "discord.js";
import muteSchema from "../../Models/mute-schema";
import { client } from "../..";
export interface MuteInterface {
    _id?: string,
    GuildID?: string;
    UserID?: string;
    reason?: string;
    expiresAt?: Date | null;
    roles?: Array<string>;
}
export class MuteClass {
    private static instance: MuteClass;
    public mutes: Collection<string, Collection<string, MuteInterface>> = new Collection();

    private constructor() {
        this.initializeData().then(() => {
            setInterval(this.checkMutes.bind(this), 10 * 1000)
            setInterval(() => {this.uploadDataToMongoose}, 30 * 1000);
        })
    }


    public static getInstance(): MuteClass {
        return this.instance || (this.instance = new MuteClass());
    }

    public async mute(member: GuildMember, mutedRole: Role, reason: string, time?: number | null): Promise<any> {
        const roles = Array.from(member.roles.cache.keys());
        if (member.roles.cache.has(mutedRole.id)) return;

        const expiresAt: Date | null = time ? new Date(time) : null;
        const muteData: MuteInterface = { reason, expiresAt, roles };
        if (!this.mutes.has(member.guild.id)) this.mutes.set(member.guild.id, new Collection());
        this.mutes.get(member.guild.id)?.set(member.id, muteData);
        const filteredroles = member.roles.cache.filter((r) => r.tags).keys()
        member.roles.set([...filteredroles, mutedRole]).catch((error) => { });
        return true;
    }


    private async checkMutes() {
        this.mutes.forEach(async (guildMutes, guildID) => {
            guildMutes.forEach(async (mute, userID) => {
                if (mute.expiresAt && mute.expiresAt.getTime() < Date.now()) {
                    const guild = client.guilds.cache.get(guildID)
                    if (!guild) return;
                    const member = await guild.members.fetch(userID)
                    if (!member) return;
                    this.removeMutes(member)
                }
            });
            if (guildMutes.size < 1) this.mutes.delete(guildID)
        });
    }

    public async isMuted(member: GuildMember, mutedRole: Role, deleteDoc: boolean = false): Promise<MuteInterface | boolean> {
        if (this.mutes.has(member.guild.id) && this.mutes.get(member.guild.id)?.has(member.id) || member.roles.cache.has(mutedRole.id)) true
        const muteData = this.mutes.get(member.guild.id)?.get(member.id);
        if (deleteDoc) this.mutes.get(member.guild.id)?.delete(member.id)
        return muteData ?? false;
    }

    public async hasMute(member: GuildMember): Promise<MuteInterface | null> {
        if (this.mutes.has(member.guild.id) && this.mutes.get(member.guild.id)?.has(member.id)) {
            return this.mutes.get(member.guild.id)?.get(member.id) ?? null;
        }
        return null;
    }

    public async removeMutes(member: GuildMember, mutedRole?: Role): Promise<void> {
        const guildCollection = this.mutes.has(member.guild.id)
        const userCollection = this.mutes.get(member.guild.id)?.get(member.id)
        if (guildCollection && userCollection) {
            this.mutes.get(member.guild.id)?.delete(member.id);
            member.roles.set(userCollection.roles!)
        }
    }

    public async initializeData(): Promise<Collection<string, Collection<string, MuteInterface>>> {
        (await muteSchema.find())
            .forEach(entry => {
                let guildCollection = this.mutes.get(entry.GuildID);
                if (!guildCollection) {
                    guildCollection = new Collection<string, MuteInterface>();
                    this.mutes.set(entry.GuildID, guildCollection);
                }
                const { _id, GuildID, UserID, Reason, expiresAt, roles } = entry;
                guildCollection.set(UserID, { _id, GuildID, UserID, reason: Reason, expiresAt: expiresAt ? new Date(expiresAt) : null, roles });
            });
        return this.mutes
    }


    public async uploadDataToMongoose() {
        try {
            const bulkOps = [];

            for (const [guildID, guildMutes] of this.mutes) {
                for (const [userID, mute] of guildMutes) {
                    const { reason, roles, _id, expiresAt } = mute;
                    bulkOps.push({
                        updateOne: {
                            filter: { GuildID: guildID, UserID: userID },
                            update: { GuildID: guildID, UserID: userID, Reason: reason, expiresAt, roles, _id },
                            upsert: true,
                        },
                    });
                }
            }

            bulkOps.length > 0 ? await muteSchema.bulkWrite(bulkOps) : await muteSchema.deleteMany()
        } catch (error) {
        }
    }

}
