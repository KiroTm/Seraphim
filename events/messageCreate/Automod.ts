import { EmbedBuilder, Message, TextChannel, WebhookClient } from "discord.js";
import { ConfigInstance } from "../../Main-Handler/ConfigHandler";
import { AutomodClass, automodtype } from "../../classes/moderation/automod";

const automodClass = AutomodClass.getInstance();

export default async (instance: ConfigInstance, message: Message) => {
    const guildId = message.guildId as string;
    const automodData = automodClass.AutomodCollection.get(guildId);
    if (!automodData) return;
    for (const [type, rules] of automodData) {
        switch (type) {
            case automodtype.BannedWords:
                checkBannedWords(message, rules);
                break;
        }
    }
};

function checkBannedWords(message: Message, rules: any[]) {
    const content = message.content
    const args = content.split(/\s+/)
    const slursFound = rules.some(rule => {
        const { query, filterType } = rule;
        return query.some((word: any) => {
            if (filterType === 'match') {
                return (args.some((arg) => arg.toLowerCase() === word.toLowerCase()))
            } else if (filterType === 'exact') {
                return (args.some((arg) => arg === word))
            } else if (filterType === 'includes') {
                return content.toLowerCase().includes(word.toLowerCase());
            }
        });
    });

    if (slursFound) {
        message.delete()     
        message.channel.send(`${message.author} Your message contains banned words and has been removed.`).then((msg) => {
            setTimeout(() => {
                msg.delete().catch(() => {})
            }, 3000);
        })
        sendLog(message)
    }
}

async function sendLog(message: Message) {
    const logsChannel = message.client.channels.cache.get('1180829802383560714') as TextChannel
    if (!logsChannel) return;
    let webhook = new WebhookClient({token: process.env.TOKEN, id: "1180834581562265660", url: "https://discord.com/api/webhooks/1180834581562265660/uiZDS14yPCRwcw9nvMK5A_9P3RNXFR3sYfFGD5qsMk1CkgDH_ibEjpvwTspDKWZc4r4w"})
    webhook?.send({
        embeds: [
            new EmbedBuilder()
            .setColor('Blue')
            .setDescription(`**Message Deleted in ${message.channel}**\n${message.content}\n**Reason**\n - Banned Words`)
            .setFooter({text: message.author.username, iconURL: message.author.displayAvatarURL()})
        ]
    })
}
