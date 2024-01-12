import { Callback, Command } from "../../typings";
import { EmbedBuilder, GuildMember, Message } from 'discord.js';
import { Utils } from "../../functions/Utils";
function h(s: string) { let h = 0; for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); h = (h << 5) - h + c; h = h & h; } return h; }
function p(a1: string, a2: string) { const h1 = h(a1); const h2 = h(a2); return (Math.abs(h1 + h2) % 101); }
function b(p: number) { const l = 10; const f = Math.round((p / 100) * l); const e = l - f; return `[${'█'.repeat(f)}${'░'.repeat(e)}] ${p}%`; }
function ship(f: string, s: string) { return { name: `${f.slice(0, f.length / 2)}${s.slice(s.length / 2)}`, percent: p(f, s) }; }

export default {
    name: 'ship',
    description: 'Ship',
    cooldown: { Duration: '2s', Type: 'perUserCooldown', CustomCooldownMessage: "If only these ships were real... But they're not, calm down." },
    callback: async ({ message, args }: Callback) => {
        const v = args.length;
        let f: GuildMember | string;
        let s: GuildMember | string;

        if (!v) [f, s] = [message.member as GuildMember, message.guild?.members.cache.random() as GuildMember];
        else if (v === 1) [f, s] = [message.mentions.members?.first() as GuildMember || args[0], message.member as GuildMember];
        else [f, s] = [message.mentions.members?.first() as GuildMember || args[0], Array.from(message.mentions.members!)[1]?.[1] as GuildMember || args[1]];

        const fa = typeof f === 'object' ? f.user.username : f;
        const sa = typeof s === 'object' ? s.user.username : s;

        const Ship = ship(fa, sa);

        message.channel.send({
            content: `**💝Matchmaking💝**\n🔺\`${fa}\`\n🔻\`${sa}\``,
            embeds: [new EmbedBuilder().setColor('#FFC0CB').setDescription(`**🔀 ${Ship.name}**\n${b(Ship.percent)}`)],
            allowedMentions: { roles: [], users: [] }
        });
    }
} as Command;
