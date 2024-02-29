import { Message } from "discord.js";
import { AutomodClass, AutomodSetupInterface, RuleConfig, automodtype } from "../../classes/moderation/automod";
import { ResponseClass } from "../../classes/Utility/Response";

const automodClass = AutomodClass.getInstance();

export default async (_: any, message: Message) => {
    const { guild, author, content } = message;
    const automodData = automodClass.AutomodCollection.get(`${guild?.id}`);

    if (!automodData || author.bot) return;

    for (const rules of automodData.values()) {
        if (rules?.type === automodtype.BannedWords && rules.enabled && rules.config) {
            const slursFound = rules.config.some(rule =>
                rule.words?.some(word => content.toLowerCase().includes(word.toLowerCase()))
            );
            if (slursFound) handleBannedWords(message, rules);
        }
    }
};

async function handleBannedWords(message: Message, rules: AutomodSetupInterface) {
    try {
        message.delete();
        new ResponseClass().sendTemporaryMessage(message, {
            content: rules.customResponse ?? `${message.author} your message contains banned words and has been removed.`,
            allowedMentions: { users: [message.author.id] }
        }, '3s', 'Create');
    } catch (_) { }
}
