import { GuildMember, Message, Role } from "discord.js";
import ModlogsSchema from "../../models/Modlogs-Schema";
import { ModlogType } from "./modlogs";

export class UnmuteClass {
    private async isMuted(member: GuildMember, mutedrole: Role) {
        if (member.roles.cache.has(mutedrole.id)) return true

    }

    public async unmute(member: GuildMember, mutedrole: Role, message: Message, reason: string) {
        if (!(await this.isMuted(member, mutedrole))) return false
        member.roles.remove(mutedrole)
        ModlogsSchema.create({
            GuildID: member.guild.id,
            UserID: member.user.id,
            StaffID: message.author.id,
            Reason: reason,
            Type: ModlogType.Unmute
        })
        return true
    }
}
