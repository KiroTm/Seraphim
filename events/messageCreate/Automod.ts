import { Message, Collection } from "discord.js";
import { AutomodClass, AutomodSetupInterface, automodtype } from "../../classes/moderation/automod";
import { ResponseClass } from "../../classes/Utility/Response";

const automodClass = AutomodClass.getInstance();
const violationsCollection: Collection<string, Collection<string, number>> = new Collection();

export default async (_: any, message: Message) => {
    const { guild, author, content, guildId, author: { id: authorId }, channelId, member } = message;
    const automodData = automodClass.AutomodCollection.get(guild?.id!);

    if (!automodData || author.bot) return;

    for (const rules of automodData.values()) {
        if (rules.type === automodtype.BannedWords && rules.enabled && rules.config) {
            const { advancedSettings } = rules;
            let advanced = false;
            if (advancedSettings) {
                const { Channel, Role } = advancedSettings;
                if (Channel.includes(channelId) || (member && Role.some(role => member.roles.cache.has(role)))) return;
            }
            const slursFound = rules.config.some(rule => rule.words?.some(word => content.toLowerCase().includes(word.toLowerCase())))
            if (slursFound) {
                Violation.add(guildId!, authorId);
                const violations = violationsCollection.get(guildId!)?.get(authorId) || 0;
                if (advancedSettings && advancedSettings.Threshold && violations >= advancedSettings.Threshold) {
                    advanced = true;
                }
                handleBannedWords(message, rules, advanced)
            }
        }
    }
};

const Violation = {
    add: (guildId: string, authorId: string) => {
        const guildViolations = violationsCollection.get(guildId) || new Collection<string, number>();
        const userViolations = guildViolations.get(authorId) || 0;
        violationsCollection.set(guildId, guildViolations.set(authorId, userViolations + 1));
    },
    reset: (guildId: string, authorId: string) => {
        const guildViolations = violationsCollection.get(guildId)
        const userViolations = guildViolations?.get(authorId)
        if (!guildViolations || !userViolations) return;
        violationsCollection.set(guildId, guildViolations.set(authorId, 0))
    }
}

function handleBannedWords(message: Message, rules: AutomodSetupInterface, limit: boolean) {
    const { guildId, author } = message
    if (limit) {
        message.channel.send("Limit has been reached")
        Violation.reset(guildId!, author.id)
    }
    try {
        message.delete();
        new ResponseClass().sendTemporaryMessage(message, {
            content: rules.customResponse ?? `${message.author} your message contains banned words and has been removed.`,
            allowedMentions: { users: [message.author.id] }
        }, '3s', 'Create');
    } catch (_) { }
}
