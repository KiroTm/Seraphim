import { Collection, Guild, GuildMember } from "discord.js";
import ModlogsSchema from "../../models/Modlogs-Schema";

export enum ModlogType {
    Mute = "Mute",
    Unmute = "Unmute",
    Ban = "Ban",
    Unban = "Unban",
    Warn = "Warn",
    Kick = "Kick",
    Other = "Other"
}

type ModlogsObject = {
    GuildID: string,
    UserID: string
    StaffID: string,
    Type: ModlogType,
    Reason: string,
    CreatedAt: string
}

export class Modlogs {
    public Modlogs = new Collection<string, ModlogsObject>()
    private static instance: Modlogs;
    private constructor() {
        this.initializeData().then(() => {
            this.PeriodicUpdates()
        })
    }
    public static getInstance(): Modlogs {
        return this.instance || (this.instance = new Modlogs());
    }

    public async create(member: GuildMember, moderator: GuildMember, type: ModlogType, reason?: string) {
        const GuildID = member.guild.id as string
        const data = await ModlogsSchema.create({ GuildID,UserID: member.id, StaffID: moderator.id, Reason: reason, Type: type})
        this.Modlogs.set(data._id, { GuildID,UserID: member.id, StaffID: moderator.id, Reason: data.reason, Type: type, CreatedAt: data.createdAt})
    }

    public async remove(id: string): Promise<void> {
        this.Modlogs.delete(id)
        return;
    }

    public getGuildModlogs(guild: Guild) {
        return this.Modlogs.filter((value, _) => value.GuildID == guild.id)
    }

    public getMemberModlogs(member: GuildMember) {
        const guild = member.guild as Guild
        return this.Modlogs.filter((value, _) => value.GuildID == guild.id && value.UserID == member.id)
    }

    private async initializeData() {
        const modlogs = await ModlogsSchema.find()
        for (const modlog of modlogs) {
            const key = modlog._id
            const muteobject: ModlogsObject = {
                UserID: modlog.UserID,
                GuildID: modlog.GuildID,
                Type: modlog.Type,
                Reason: modlog.Reason,
                StaffID: modlog.StaffID,
                CreatedAt: modlog.createdAt
            }
            this.Modlogs.set(key, muteobject)
        }
    }

    private async uploadDataToMongoDB() {

    }

    private PeriodicUpdates() {
        setTimeout(() => {
            this.uploadDataToMongoDB()
        }, 1000 * 30);
    }
}
