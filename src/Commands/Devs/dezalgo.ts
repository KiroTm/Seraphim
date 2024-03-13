import { Callback, Command } from "../../../typings";
import { alphabets } from "../../Events/messageCreate/Automod";
export default {
    name: 'dezalgo',
    description: 'Dezalgo a string',
    ownersOnly: true,
    callback: async ({ message, args }: Callback) => {
        const content = args.join()
        const reverseAlphabets: Record<string, string> = {};
        for (const alphabet in alphabets) {
            const alternatives = alphabets[alphabet as keyof typeof alphabets];
            for (const alternative of alternatives) {
                reverseAlphabets[alternative] = alphabet;
            }
        }
        let converted = '';
        for (let i = 0; i < content.length; i++) {
            const char = content[i];
            const alphabet = reverseAlphabets[char];
            alphabet ?
                char === char.toUpperCase() ?
                    converted += alphabet.toUpperCase() :
                    converted += alphabet.toLowerCase() :
                converted += char;
        }
        message.channel.send(`${converted}`)
    }
} as Command