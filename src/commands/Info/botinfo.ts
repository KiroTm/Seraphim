import { Callback, Command } from "../../../typings";
import { EmbedBuilder } from "discord.js";
import { CpuInfo, cpus } from 'os';
import { CodeStatistics } from "../../classes/misc/codestats";
export default {
    name: "botinfo",
    description: "Displays bot's information",
    callback: async ({ message, instance, client }: Callback) => {
        try {
            console.log("ran")
            console.log(((await new CodeStatistics().count()).linesOfCode))
            const titles = { latency: 'Latency', stats: 'Statistics', uptime: 'Uptime', misc: 'Misc', serverUsage: "CPU usage" };
            const stats = generalStatistics(instance);
            const uptimeStats = uptimeStatistics(instance);
            const usageStats = usageStatistics();

            const embedFields = [
                { name: titles.latency, value: `Bot Ping: \`${client.ws.ping}\`ms`, inline: true },
                { name: titles.stats, value: ` Users: \`${stats.users}\`\n Servers: \`${stats.guilds}\`\n Channels: \`${stats.channels}\``, inline: true },
                { name: titles.uptime, value: ` Client: ${uptimeStats.client}`, inline: true },
                { name: titles.serverUsage, value: ` Heap: \`${usageStats.ramUsed}MB\` (Total: \`${usageStats.ramTotal}MB\`)\n CPU Load: ${usageStats.cpuLoad}`, inline: true },
            ];

            await message.channel.send({embeds: [new EmbedBuilder().setTitle('Bot Information').setColor('#2B2D32').addFields(embedFields)]});
        } catch (error) {
            console.log(error)
        }
    }
} as Command;

function generalStatistics(instance: any) {
    const { client } = instance;
    return {
        channels: client.channels.cache.size.toLocaleString(),
        guilds: client.guilds.cache.size.toLocaleString(),
        nodeJs: process.version,
        users: client.guilds.cache.reduce((acc: any, val: any) => acc + (val.memberCount ?? 0), 0).toLocaleString()
    };
}

function uptimeStatistics(instance: any) {
    const now = Date.now();
    return { client: new Date(now - instance._client?.uptime!).toLocaleTimeString() }
}

function usageStatistics() {
    const usage = process.memoryUsage();
    return {
        cpuLoad: `\`${cpus().map(formatCpuInfo).join('` `')}\``,
        ramTotal: `${(usage.heapTotal / 1048576).toFixed(2)}`,
        ramUsed: `${(usage.heapUsed / 1048576).toFixed(2)}`
    };
}

function formatCpuInfo({ times }: CpuInfo) {
    return `${Math.round(((times.user + times.nice + times.sys + times.irq) / times.idle) * 10000) / 100}%`;
}