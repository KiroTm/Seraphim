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
    private readonly timer: NodeJS.Timeout;
    private constructor() {
        this.cacheMutes()
        this.timer = setInterval(this.cacheMutes.bind(this), 30 * 1000)
    }
    public static getInstance(): Modlogs {
        return this.instance || (this.instance = new Modlogs());
    }

    public async create(member: GuildMember, moderator: GuildMember, type: ModlogType, reason?: string) {
        const GuildID = member.guild.id as string
        ModlogsSchema.create({
            GuildID,
            UserID: member.id,
            StaffID: moderator.id,
            Reason: reason,
            Type: type
        })
    }

    public async remove(id: string) {
        return (await ModlogsSchema.findOneAndDelete({ _id: id }))

    }

    public async fetch(member: GuildMember) {
        const guild = member.guild as Guild
        return (await ModlogsSchema.find({ GuildID: guild.id, UserID: member.user.id }))
    }

    private async cacheMutes() {
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
}