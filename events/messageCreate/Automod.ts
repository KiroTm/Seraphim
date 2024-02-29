import { EmbedBuilder, Message, TextChannel, WebhookClient } from "discord.js";
import { ConfigInstance } from "../../Main-Handler/ConfigHandler";
import { AutomodClass, automodtype } from "../../classes/moderation/automod";
import { ResponseClass } from "../../classes/Utility/Response";

const automodClass = AutomodClass.getInstance();

export default async (instance: ConfigInstance, message: Message) => {
    const { guildId, author, content } = message;
    const automodData = automodClass.AutomodCollection.get(guildId as string);

    if (!automodData || author.bot) return;

    for (const [type, rules] of automodData) {
        switch (type) {
            case automodtype.BannedWords:
                // checkBannedWords(message, rules);
                break;
        }
    }
};

function checkBannedWords(message: Message, rules: any[]) {
    const { content } = message;
    const args = content.split(/\s+/);
    
    const slursFound = rules.some(rule => {
        const { query, filterType } = rule;
        return query.some((word: any) => {
            const lowerWord = word.toLowerCase();
            if (filterType === 'match') {
                return args.some(arg => arg.toLowerCase() === lowerWord);
            } else if (filterType === 'exact') {
                return args.includes(word);
            } else if (filterType === 'includes') {
                return content.toLowerCase().includes(lowerWord);
            }
        });
    });

    if (slursFound) {
        handleBannedWords(message);
    }
}

async function handleBannedWords(message: Message) {
    try {
        message.delete();
        new ResponseClass().sendTemporaryMessage(message, {
            content: `${message.author} Your message contains banned words and has been removed.`,
            allowedMentions: { users: [message.author.id] }
        }, '3s', 'Create');
    } catch (error) {
        console.error("Error deleting message:", error);
    }
}
