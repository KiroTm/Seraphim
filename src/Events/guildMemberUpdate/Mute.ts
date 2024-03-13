import { GuildMember, Role } from "discord.js";
import { ConfigHandler } from "../../../Main-Handler/ConfigHandler";
import { MuteClass } from "../../Classes/moderation/mute";
const muteClass = MuteClass.getInstance();

export default async (instance: ConfigHandler, OldMember: GuildMember, NewMember: GuildMember) => {
    const mutedRole = OldMember.guild.roles.cache.find((r) => r.name.toLowerCase() == 'muted') as Role;
    if (!mutedRole) return;
    if (OldMember.roles.cache.has(mutedRole.id) && !NewMember.roles.cache.has(mutedRole.id)) {
        let isMuted = await (muteClass.isMuted(NewMember, mutedRole,true))
        if (typeof isMuted !== 'object') return;
        NewMember.roles.set(isMuted.roles!).catch()
    }
}
