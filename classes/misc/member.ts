import { Client, Guild, GuildMember, GuildMemberFlags, Message, PermissionFlagsBits, Role, UserFlagsBitField } from 'discord.js';
import { MuteClass } from '../moderation/mute';
const muteClass = MuteClass.getInstance();

export class MemberClass {
    public fetch(guild: Guild, query: string, message?: Message): GuildMember | undefined {
        return message?.mentions?.members?.first() 
        || guild.members.cache.get(query) 
        || guild.members.cache.find((member) => member.nickname?.toLowerCase() == query.toLowerCase())
        || guild.members.cache.find((member) => member.nickname?.toLowerCase().includes(query.toLowerCase()))
        || guild.members.cache.find((member) => member.user.globalName?.toLowerCase() == query.toLowerCase())
        || guild.members.cache.find((member) => member.user.username.toLowerCase() == query.toLowerCase()) 
        || guild.members.cache.find((member) => member.user.username.toLowerCase().includes(query.toLowerCase())) 
        || undefined
      }
      
    public async mute(member: GuildMember, mutedrole: Role, reason: string, time?: number | null): Promise<void> {
        await muteClass.mute(member, mutedrole, reason, time);
    }

    public getAcknowledgment(member: GuildMember) {
        let result: string = "";
        if (member.permissions.has(PermissionFlagsBits.ViewChannel)) {
            result = "Server Member"
        };
        if (member.permissions.has(PermissionFlagsBits.KickMembers)) {
            result = "Server Moderator"
        };
        if (member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            result = "Server Manager"
        };
        if (member.permissions.has(PermissionFlagsBits.Administrator)) {
            result = "Server Admin"
        };
        if (member.id === member.guild.ownerId) {
            result = "Server Owner"
        };
        return result
    }

    public getformatPermissions(permissions: string[]): string[] {
        const formatPermission = (permission: string): string | undefined => {
            switch (permission) {
                case 'Administrator':
                    return 'Administrator';
                case 'BanMembers':
                    return 'Ban Members';
                case 'KickMembers':
                    return 'Kick Members';
                case 'ManageChannels':
                    return 'Manage Channels';
                case 'ManageMessages':
                    return 'Manage Messages';
                case 'ManageRoles':
                    return 'Manage Roles';
                case 'AddReactions':
                    return 'Add Reactions';
                case 'AttachFiles':
                    return 'Attach Files';
                case 'ChangeNickname':
                    return 'Manage Nicknames';
                case 'Connect':
                    return 'Connect';
                case 'CreateInstantInvite':
                    return 'Create Instant Invites';
                case 'CreatePrivateThreads':
                    return 'Create Private Threads';
                case 'CreatePublicThreads':
                    return 'Create Public Threads';
                case 'EmbedLinks':
                    return 'Embed Links';
                case 'ReadMessageHistory':
                    return 'Read Message History';
                case 'RequestToSpeak':
                    return 'Request to Speak';
                case 'SendMessages':
                    return 'Send Messages';
                case 'SendMessagesInThreads':
                    return 'Send Messages in Threads';
                case 'Speak':
                    return 'Speak';
                case 'Stream':
                    return 'Video';
                case 'UseApplicationCommands':
                    return 'Use Application Commands';
                case 'UseEmbeddedActivities':
                    return 'Use Embedded Activities';
                case 'UseExternalEmojis':
                    return 'Use External Emojis';
                case 'UseExternalStickers':
                    return 'Use External Stickers';
                case 'UseVAD':
                    return 'Use Voice Activity';
                case 'ViewChannel':
                    return 'View Channels';
            }
        };

        const descriptionList: string[] = [];
        const seen: Set<string> = new Set();

        for (const permission of permissions) {
            const description = formatPermission(permission);
            if (description && !seen.has(description)) {
                descriptionList.push(description);
                seen.add(description);
            }
        }
        return descriptionList;
    };

    public getFlags(flags: Array<any>) {
        return flags
            .join(", ")
            .replace("ActiveDeveloper", "<:VerifiedDev:1158844569178353745>")
            .replace("BotHTTPInteractions", "BHI")
            .replace("BugHunterLevel1", "<:BugHunterBase:1158844802297766038>")
            .replace("BugHunterLevel2", "<:BugHunterGolden:1158844844031098891>")
            .replace("CertifiedModerator", "<:DiscordMod:1158844887999987732>")
            .replace("Collaborator", "")
            .replace("DisablePremium", "DP")
            .replace("HasUnreadUrgentMessages", "HUUM")
            .replace("HypeSquadOnlineHouse1", "<:HypeSquadBravery:1158844334490271854>")
            .replace("HypeSquadOnlineHouse2", "<:HypeSquadBrilliance:1158844430724374548>")
            .replace("HypeSquadOnlineHouse3", "<:HypeSquadBalance:1158844508771995769>")
            .replace("Hypesquad", "<:HypeSquadPremium:1158845095194415146>")
            .replace("MFASMS", "MFASMS")
            .replace("Partner", "<:DiscordParrnered:1158845208650321962>")
            .replace("PremiumEarlySupporter", "<:EarlySupporter:1158844691064823849>")
            .replace("PremiumPromoDismissed", "PPD")
            .replace("Quarantined", "Q")
            .replace("RestrictedCollaborator", "RC")
            .replace("Spammer", "SP")
            .replace("Staff", "<:DiscordStaff:1158845144984989776>")
            .replace("TeamPseudoUser", "TP")
            .replace("VerifiedBot", "<:VerifiedBot:1158844629433725038>")
            .replace("VerifiedDeveloper", "<:VerifiedDeveloper:1158845025535406181>");
    }
}
