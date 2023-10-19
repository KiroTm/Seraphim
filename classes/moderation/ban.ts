import { GuildMember } from "discord.js";

export class BanClass {
    public isbannable(member: GuildMember, bot: GuildMember): {result: boolean, remarks?: string} {
        if (member.permissions.has('Administrator')) {
            return {result: false, remarks: "That user is an Admin! I can't ban them."}
        } else if (member.roles.highest.position < bot.roles.highest.position) {
            return {result: false, remarks: "My highest role is below than that of the target! I can't ban them."}
        } else if ( bot.permissions.has('BanMembers')) {
            return {result: false, remarks: `${bot.user.username} doesn't have Ban Member permission to execute that action!`}
        }
        return {result: true}

    }
}