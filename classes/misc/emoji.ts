import { parseEmoji } from "discord.js";

export class EmojiClass {
    public imagify(emoji: string | undefined) {
        if (!emoji) return undefined
        const parsed = parseEmoji(emoji)
        if (parsed && parsed.id) {
            const extension = parsed.animated ? '.gif' : '.png';
            return `https://cdn.discordapp.com/emojis/${parsed.id + extension}` ?? undefined
        }
    }
}